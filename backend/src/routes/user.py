from flask import Blueprint, jsonify, request
from src.models.user import User, db

user_bp = Blueprint('user', __name__)

@user_bp.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@user_bp.route('/users', methods=['POST'])
def create_user():
    try:
        data = request.json
        
        # Validar dados obrigatórios
        if not all(k in data for k in ('username', 'email', 'user_type')):
            return jsonify({'error': 'Dados obrigatórios: username, email, user_type'}), 400
        
        # Validar user_type
        if data['user_type'] not in ['passenger', 'driver']:
            return jsonify({'error': 'user_type deve ser "passenger" ou "driver"'}), 400
        
        # Verificar se username já existe
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Nome de usuário já existe'}), 400
        
        # Verificar se email já existe
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email já existe'}), 400
        
        user = User(
            username=data['username'], 
            email=data['email'],
            user_type=data['user_type'],
            is_available=data.get('is_available', False)
        )
        db.session.add(user)
        db.session.commit()
        return jsonify(user.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())

@user_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        user = User.query.get_or_404(user_id)
        data = request.json
        
        # Atualizar campos permitidos
        if 'username' in data:
            # Verificar se novo username já existe (exceto o próprio usuário)
            existing = User.query.filter_by(username=data['username']).first()
            if existing and existing.id != user_id:
                return jsonify({'error': 'Nome de usuário já existe'}), 400
            user.username = data['username']
        
        if 'email' in data:
            # Verificar se novo email já existe (exceto o próprio usuário)
            existing = User.query.filter_by(email=data['email']).first()
            if existing and existing.id != user_id:
                return jsonify({'error': 'Email já existe'}), 400
            user.email = data['email']
        
        if 'is_available' in data:
            user.is_available = data['is_available']
        
        db.session.commit()
        return jsonify(user.to_dict())
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        user = User.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()
        return '', 204
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
