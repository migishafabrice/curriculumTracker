from flask import Flask, jsonify, request
import PyPDF2
import re
import mysql.connector
from mysql.connector import Error
import json
from werkzeug.utils import secure_filename
import os

app = Flask(__name__)

# MySQL database configuration
db_config = {
    'host': 'localhost',
    'user': 'your_username',
    'password': 'your_password',
    'database': 'learning_outcomes_db'
}

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def create_database_connection():
    try:
        connection = mysql.connector.connect(**db_config)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def extract_learning_outcomes(pdf_path):
    outcomes = []
    current_outcome = {}
    
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        
        for page_num in range(len(reader.pages)):
            page = reader.pages[page_num]
            text = page.extract_text()
            
            # Split text into lines for processing
            lines = text.split('\n')
            
            for i, line in enumerate(lines):
                # Detect Learning Outcome headers
                outcome_match = re.match(r'^Learning Outcome (\d+\.\d+): (.+)$', line.strip())
                if outcome_match:
                    # If we have a current outcome being processed, save it before starting new one
                    if current_outcome:
                        outcomes.append(current_outcome)
                        current_outcome = {}
                    
                    outcome_num = outcome_match.group(1)
                    outcome_title = outcome_match.group(2)
                    current_outcome = {
                        'outcome_number': outcome_num,
                        'outcome_title': outcome_title,
                        'content': []
                    }
                
                # Detect content sections (lines that start with bullet points or checkmarks)
                elif current_outcome and (line.strip().startswith('-') or line.strip().startswith('✓')):
                    # Clean up the content line
                    content = line.strip().lstrip('-✓ ').strip()
                    if content:
                        current_outcome['content'].append(content)
                
                # Detect multi-line content by checking indentation
                elif current_outcome and current_outcome['content'] and line.strip() and not line.strip().startswith(('Learning Outcome', 'Formative', 'Checklist', 'Observation')):
                    # Append to last content item if it's likely a continuation
                    if current_outcome['content']:
                        current_outcome['content'][-1] += ' ' + line.strip()
    
    # Add the last outcome if it exists
    if current_outcome:
        outcomes.append(current_outcome)
    
    return outcomes

def save_outcomes_to_db(outcomes):
    connection = create_database_connection()
    if not connection:
        return False
    
    try:
        cursor = connection.cursor()
        
        for outcome in outcomes:
            # Convert content list to JSON string
            content_json = json.dumps(outcome['content'])
            
            # Insert or update record
            query = """
                INSERT INTO learning_outcomes (outcome_number, outcome_title, content)
                VALUES (%s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    outcome_title = VALUES(outcome_title),
                    content = VALUES(content)
            """
            cursor.execute(query, (outcome['outcome_number'], outcome['outcome_title'], content_json))
        
        connection.commit()
        return True
    except Error as e:
        print(f"Error saving to database: {e}")
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/extract-outcomes', methods=['POST'])
def upload_and_extract():
    # Check if file was uploaded
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    
    # Check if file has an allowed extension
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            # Extract outcomes from PDF
            outcomes = extract_learning_outcomes(filepath)
            
            # Save to database
            if save_outcomes_to_db(outcomes):
                return jsonify({
                    'success': True,
                    'message': f'Successfully extracted {len(outcomes)} learning outcomes',
                    'outcomes': outcomes
                })
            else:
                return jsonify({
                    'success': False,
                    'error': 'Failed to save outcomes to database'
                }), 500
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
        finally:
            # Clean up - remove the uploaded file
            if os.path.exists(filepath):
                os.remove(filepath)
    else:
        return jsonify({
            'success': False,
            'error': 'Invalid file type. Only PDF files are allowed'
        }), 400

@app.route('/outcomes', methods=['GET'])
def get_outcomes():
    connection = create_database_connection()
    if not connection:
        return jsonify({'success': False, 'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT id, outcome_number, outcome_title, content FROM learning_outcomes")
        outcomes = cursor.fetchall()
        
        # Convert JSON strings back to Python objects
        for outcome in outcomes:
            outcome['content'] = json.loads(outcome['content'])
        
        return jsonify({
            'success': True,
            'outcomes': outcomes,
            'count': len(outcomes)
        })
    except Error as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == '__main__':
    app.run(debug=True)