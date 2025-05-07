import fitz  # PyMuPDF
import re
import json
import os
import unicodedata
from PIL import Image
import pytesseract
from flask import Blueprint, jsonify, request
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv

load_dotenv()

# Initialize Flask Blueprint
curriculum_blueprint = Blueprint('curriculum', __name__)

# Database configuration
db_config = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME'),
    'port': int(os.getenv('DB_PORT', 3306))
}

class CurriculumProcessor:
    """Handles PDF extraction, symbol normalization, and outcome parsing."""
    
    def __init__(self):
        self.symbol_map = {
            # Checkmarks
            '\u2713': '✓', '\u2714': '✓', '\u2705': '✓', '\u2611': '✓',
            # Bullets
            '\u2022': '•', '\u25cf': '●', '\u25e6': '◦', '\u2043': '⁃',
            '\uf0b7': '•', '\u25aa': '▪', '\u25a0': '■', '\u25c6': '◆',
            # OCR corrections
            'v': '✓', 'x': '✓', 'o': '●', '-': '•'
        }
    
    def extract_text(self, file_path: str) -> str:
        """Extract and normalize text from PDF with symbol handling."""
        try:
            doc = fitz.open(file_path)
            full_text = ""
            
            for page in doc:
                # Text layer extraction
                text = page.get_text("text", flags=fitz.TEXT_PRESERVE_LIGATURES)
                
                # OCR fallback for sparse text
                if len(text.strip()) < 50 and len(page.get_text("words")) < 10:
                    pix = page.get_pixmap()
                    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                    text += pytesseract.image_to_string(img)
                
                full_text += text + "\n"
            
            return self._normalize_symbols(full_text)
        except Exception as e:
            print(f"Extraction error: {e}")
            return ""

    def _normalize_symbols(self, text: str) -> str:
        """Normalize symbols to standard forms."""
        for orig, normalized in self.symbol_map.items():
            text = text.replace(orig, normalized)
        return text

    def parse_outcomes(self, text: str) -> dict:
        """Parse learning outcomes into structured format."""
        outcomes = []
        current_outcome = {}
        current_main_point = None
        
        for line in text.split('\n'):
            line = line.strip()
            if not line:
                continue
            
            # Match outcome headers
            if re.match(r'^(Learning Outcome|LO)\s?\d+[\.\d]*[:.]?\s?', line, re.I):
                if current_outcome:
                    if current_main_point:
                        current_outcome['content'].append(current_main_point)
                    outcomes.append(current_outcome)
                current_outcome = {'title': line, 'content': []}
                current_main_point = None
                continue
            
            # Main points (bullets)
            if re.match(r'^[•●▪]', line):
                if current_main_point and current_outcome:
                    current_outcome['content'].append(current_main_point)
                current_main_point = {'main_point': line[1:].strip(), 'subpoints': []}
                continue
            
            # Sub-points (checkmarks)
            if re.match(r'^[✓✔☑]', line) and current_main_point:
                current_main_point['subpoints'].append(line[1:].strip())
                continue
            
            # Continuation lines
            if current_main_point:
                if current_main_point['subpoints']:
                    current_main_point['subpoints'][-1] += f" {line}"
                else:
                    current_main_point['main_point'] += f" {line}"
        
        # Final cleanup
        if current_main_point and current_outcome:
            current_outcome['content'].append(current_main_point)
        if current_outcome:
            outcomes.append(current_outcome)
        
        return {'outcomes': outcomes}

# Database functions
def create_db_connection():
    """Create and return a MySQL connection."""
    try:
        return mysql.connector.connect(**db_config)
    except Error as e:
        print(f"DB connection error: {e}")
        return None

def save_curriculum(data: dict, outcomes: dict) -> bool:
    """Save curriculum data to database."""
    connection = create_db_connection()
    if not connection:
        return False
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO curricula (
                    code, name, duration, education_type_code, 
                    level_type_code, section_type_code, class_type_code, 
                    details, description, document_path, issued_on
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                data['code'], data['name'], data['duration'],
                data['education_type'], data['level_type'],
                data['section_type'], data['class_type'],
                json.dumps(outcomes), data['description'],
                data['document_path'], data['issued_on']
            ))
        connection.commit()
        return True
    except Error as e:
        print(f"DB save error: {e}")
        return False
    finally:
        if connection and connection.is_connected():
            connection.close()

# Flask routes
@curriculum_blueprint.route('/add-curriculum', methods=['POST'])
def add_curriculum():
    processor = CurriculumProcessor()
    
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = [
            'code', 'name', 'education_type', 'level_type', 
            'section_type', 'class_type', 'description', 
            'duration', 'document', 'document_path', 'issued_on'
        ]
        if missing := [f for f in required_fields if f not in data]:
            return jsonify({
                'success': False,
                'error': f'Missing fields: {", ".join(missing)}'
            }), 400
        
        # Verify document exists
        if not os.path.isfile(data['document']):
            return jsonify({
                'success': False,
                'error': 'Document file not found'
            }), 400
        
        # Process PDF
        text = processor.extract_text(data['document'])
        if not text:
            return jsonify({
                'success': False,
                'error': 'Text extraction failed'
            }), 400
        
        outcomes = processor.parse_outcomes(text)
        
        # Save to database
        if not save_curriculum(data, outcomes):
            return jsonify({
                'success': False,
                'error': 'Database save failed'
            }), 500
        
        return jsonify({
            'success': True,
            'message': 'Curriculum processed successfully',
            'outcomes': outcomes
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500

@curriculum_blueprint.route('/curricula', methods=['GET'])
def get_curricula():
    """Fetch all curricula from database."""
    connection = create_db_connection()
    if not connection:
        return jsonify({
            'success': False,
            'error': 'Database connection failed'
        }), 500
    
    try:
        with connection.cursor(dictionary=True) as cursor:
            cursor.execute("""
                SELECT code, name, education_type_code, level_type_code,
                       section_type_code, class_type_code, description,
                       duration, document_path, details, issued_on
                FROM curricula
            """)
            results = cursor.fetchall()
            
            # Convert JSON strings back to objects
            for row in results:
                if row['details']:
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
        if connection and connection.is_connected():
            connection.close()