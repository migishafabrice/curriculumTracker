import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # MySQL configuration
    MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
    MYSQL_USER = os.getenv('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', 'admin@12345')
    MYSQL_DB = os.getenv('MYSQL_DB', 'curriculum')
    
    # File upload settings
    UPLOAD_FOLDER = '../data'
    ALLOWED_EXTENSIONS = {'pdf'}
    
    @staticmethod
    def init_app(app):
        app.config['UPLOAD_FOLDER'] = Config.UPLOAD_FOLDER