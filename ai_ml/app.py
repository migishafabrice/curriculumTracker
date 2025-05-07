from flask import Flask
from models.add_curriculum import curriculum_blueprint

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB limit
app.register_blueprint(curriculum_blueprint)  # All routes are now handled by the blueprint

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)