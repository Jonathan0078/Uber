import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from src.models.user import db
from src.models.ride import Ride
from src.models.message import Message
from src.routes.user import user_bp
from src.routes.ride import ride_bp
from src.routes.message import message_bp

def create_app():
    app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
    app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

    # Habilitar CORS para GitHub Pages, Replit e desenvolvimento
    allowed_origins = [
        "https://Jonathan0078.github.io",
        "https://*.replit.dev",
        "https://*.replit.app", 
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://JonathanOliveira.pythonanywhere.com"
    ]
    CORS(app, origins=allowed_origins, methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"], supports_credentials=True, allow_headers=["Content-Type", "Authorization"])

    # Registrar blueprints
    app.register_blueprint(user_bp, url_prefix='/api')
    app.register_blueprint(ride_bp, url_prefix='/api')
    app.register_blueprint(message_bp, url_prefix='/api')

    # Configuração do banco de dados
    database_path = os.path.join(os.path.dirname(__file__), 'database', 'app.db')
    os.makedirs(os.path.dirname(database_path), exist_ok=True)
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{database_path}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    with app.app_context():
        db.create_all()

    @app.route('/')
    def home():
        return jsonify({
            "message": "Uber App Backend API",
            "version": "1.0.0",
            "status": "running",
            "endpoints": {
                "users": "/api/users",
                "rides": "/api/rides", 
                "messages": "/api/messages"
            }
        })

    @app.route('/health')
    def health():
        return jsonify({"status": "healthy", "message": "Backend is running"})

    @app.route('/<path:path>')
    def serve(path):
        static_folder_path = app.static_folder
        if static_folder_path is None:
                return "Static folder not configured", 404

        if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
            return send_from_directory(static_folder_path, path)
        else:
            index_path = os.path.join(static_folder_path, 'index.html')
            if os.path.exists(index_path):
                return send_from_directory(static_folder_path, 'index.html')
            else:
                return jsonify({"error": "index.html not found"}), 404

    return app

# Create the Flask app
app = create_app()

if __name__ == '__main__':
    # For local development
    app.run(host='0.0.0.0', port=5000, debug=True)
else:
    # For production (PythonAnywhere)
    # The app will be served by the WSGI server
    pass
