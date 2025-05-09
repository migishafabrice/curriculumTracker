from flask import Blueprint, jsonify, request
import fitz
import re
import mysql.connector
from mysql.connector import Error
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Blueprint setup
curriculum_blueprint = Blueprint('curriculum', __name__)

# Database configuration
db_config = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME'),
    'port': int(os.getenv('DB_PORT', 3306))
}

def create_database_connection():
    """Create and return a MySQL connection."""
    try:
        return mysql.connector.connect(**db_config)
    except Error as e:
        return None
def extract_text_from_pdf(file_path):
    """Extract text content from PDF file using PyMuPDF (fitz)."""
    try:
        text = ""
        with fitz.open(file_path) as doc:
            for page in doc:
                text += page.get_text() + "\n"
        return text.strip()  # Remove trailing newline
    except Exception as e:
        print(f"PDF processing error: {e}")
        return None

def extract_learning_outcomes(text: str) -> str:
    outcomes: List[Dict] = []
    current_outcome: Dict = {}
    seen_content: set = set()
    capturing_content = False
    
    for line in text.split('\n'):
        line = line.strip()
        
        # Detect Learning Outcome headers
        if match := re.match(r'^Learning Outcome\s?(\d+\.\d+)\s?:\s?(.+)$', line, re.IGNORECASE):
            if current_outcome:  # Save previous outcome if exists
                outcomes.append(current_outcome)
                seen_content = set()  # Reset for new outcome
            
            current_outcome = {
                "Learning Outcome": match.group(1)+' - ' + match.group(2).strip(),
                'content': []
            }
            capturing_content = True
            continue
            
        # Skip lines that start with 'o' or '-' (as per original comment)
        if line.startswith(('o', '-')):
            capturing_content = False
            continue
            
        # Capture content lines when inside an outcome
        if capturing_content and line:
            content = line.strip()
            if content and content not in seen_content:
                current_outcome['content'].append(content)
                seen_content.add(content)
    
    if current_outcome:  # Add the last outcome
        outcomes.append(current_outcome)
    
    return json.dumps(outcomes, indent=2, ensure_ascii=False)


def save_curriculum(data, outcomes_json):
    """Save curriculum data to MySQL database."""
    print("Saving curriculum data to database...")
    connection = create_database_connection()
    if not connection:
        return False
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
            INSERT INTO curricula(code, name, duration,
                     education_type_code, level_type_code, section_type_code,
                      class_type_code, details, description, document_path,
                       issued_on
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                data['code'],
                data['name'],
                data['duration'],
                data['education_type'],
                data['level_type'],
                data['section_type'],
                data['class_type'],
                outcomes_json,
                data['description'],
                data['document_path'], 
                data['issued_on']
            ))
        connection.commit()
        return True
    except Error as e:
        print(f"Database save error: {e}")
        return False
    finally:
        if connection.is_connected():
            connection.close()

@curriculum_blueprint.route('/add-curriculum', methods=['POST'])
def add_curriculum():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = [
            'code', 'name', 'education_type', 'level_type', 'section_type',
            'class_type', 'description', 'duration', 'document','document_path', 'issued_on'
        ]
        if missing := [field for field in required_fields if field not in data]:
            return jsonify({
                'success': False,
                'error': f'Missing fields: {", ".join(missing)}'
            }), 400
        
        # Verify document file exists
        if not os.path.isfile(data['document']):
            return jsonify({
                'success': False,
                'error': 'Document file not found'
            }), 400
        
        # Extract text from PDF
        pdf_text = extract_text_from_pdf(data['document'])
        if not pdf_text:
            return jsonify({
                'type': 'error',
                'message': 'Failed to extract text from PDF'
            }), 400
        
        # Process outcomes (returns JSON string)
        outcomes_json = extract_learning_outcomes(pdf_text)
        
        # Save to database
        if not save_curriculum(data, outcomes_json):
            return jsonify({
                'type': 'error',
                'message': 'Failed to save curriculum to database'
            }), 500
        
        return jsonify({
            'type': 'success',
            'message': 'Curriculum added and extracted successfully',
            
        })

    except Exception as e:
        return jsonify({
            'type': 'error',
            'message': f'Server error: {str(e)}'
        }), 500

@curriculum_blueprint.route('/curricula', methods=['GET'])
def get_curricula():
    """Fetch all curricula from database."""
    connection = create_database_connection()
    if not connection:
        return jsonify({
            'type': 'error',
            'message': 'Database connection failed',
            
        }), 500
    
    try:
        with connection.cursor(dictionary=True) as cursor:
            cursor.execute("""
                SELECT 
                    code, name, education_type, level_type, 
                    section_type, class_type, description, 
                    duration, document_path, details, issued_on
                FROM curricula
            """)
            results = cursor.fetchall()
            
            # Convert JSON strings back to objects
            for row in results:
                row['details'] = json.loads(row['details'])
            
            return jsonify({
                'success': True,
                'count': len(results),
                'curricula': results
            })
    except Error as e:
        return jsonify({
            'success': False,
            'error': f'Database error: {str(e)}'
        }), 500
    finally:
        if connection.is_connected():
            connection.close()