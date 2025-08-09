from flask import Blueprint, request, jsonify
import requests
import os
from src.models.user import db, User
from src.models.ride import Ride
from src.models.message import Message

message_bp = Blueprint('message', __name__)

@message_bp.route('/rides/<int:ride_id>/messages', methods=['POST'])
def send_message(ride_id):
    """Enviar mensagem entre passageiro e motorista"""
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        if not all(k in data for k in ('sender_id', 'content')):
            return jsonify({'error': 'Dados obrigatórios: sender_id, content'}), 400
        
        # Verificar se a corrida existe
        ride = Ride.query.get(ride_id)
        if not ride:
            return jsonify({'error': 'Corrida não encontrada'}), 404
        
        # Verificar se o remetente é parte da corrida
        sender = User.query.get(data['sender_id'])
        if not sender:
            return jsonify({'error': 'Usuário remetente não encontrado'}), 404
        
        # Determinar o destinatário
        if sender.id == ride.passenger_id:
            receiver_id = ride.driver_id
        elif sender.id == ride.driver_id:
            receiver_id = ride.passenger_id
        else:
            return jsonify({'error': 'Usuário não faz parte desta corrida'}), 403
        
        if not receiver_id:
            return jsonify({'error': 'Destinatário não definido (corrida não aceita)'}), 400
        
        # Criar mensagem
        message = Message(
            ride_id=ride_id,
            sender_id=data['sender_id'],
            receiver_id=receiver_id,
            content=data['content']
        )
        
        db.session.add(message)
        db.session.commit()
        
        # Disparar GitHub Action para notificação
        try:
            trigger_github_action(message.to_dict())
        except Exception as e:
            print(f"Erro ao disparar GitHub Action: {e}")
        
        return jsonify(message.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@message_bp.route('/rides/<int:ride_id>/messages', methods=['GET'])
def get_messages(ride_id):
    """Obter mensagens de uma corrida"""
    try:
        # Verificar se a corrida existe
        ride = Ride.query.get(ride_id)
        if not ride:
            return jsonify({'error': 'Corrida não encontrada'}), 404
        
        # Buscar mensagens da corrida
        messages = Message.query.filter_by(ride_id=ride_id).order_by(Message.created_at.asc()).all()
        
        return jsonify([message.to_dict() for message in messages]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def trigger_github_action(message_data):
    """Disparar GitHub Action para processar mensagem"""
    # Esta função será implementada quando configurarmos o GitHub Actions
    # Por enquanto, apenas simula o disparo
    
    github_token = os.getenv('GITHUB_TOKEN')
    if not github_token:
        print("GITHUB_TOKEN não configurado")
        return
    
    # URL para disparar repository_dispatch
    url = "https://api.github.com/repos/Jonathan0078/Uber/dispatches"
    
    headers = {
        'Authorization': f'token {github_token}',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
    }
    
    payload = {
        'event_type': 'message_sent',
        'client_payload': message_data
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 204:
            print("GitHub Action disparado com sucesso")
        else:
            print(f"Erro ao disparar GitHub Action: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Erro na requisição para GitHub: {e}")

