import os
from werkzeug.utils import secure_filename
from config import Config

class FileUtils:
    @staticmethod
    def allowed_file(filename: str) -> bool:
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS
    
    @staticmethod
    def save_uploaded_file(file) -> str:
        if file and FileUtils.allowed_file(file.filename):
            filename = secure_filename(file.filename)
            os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
            file_path = os.path.join(Config.UPLOAD_FOLDER, filename)
            file.save(file_path)
            return file_path
        return None