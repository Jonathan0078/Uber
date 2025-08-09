from flask import Blueprint, request, jsonify
from src.models.user import db, User
from src.models.ride import Ride
from src.models.message import Message

ride_bp = Blueprint('ride', __name__)

@ride_bp.route('/rides', methods=['POST'])
def create_ride():
    """Criar uma nova corrida"""
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        if not all(k in data for k in ('passenger_id', 'origin', 'destination')):
            return jsonify({'error': 'Dados obrigatórios: passenger_id, origin, destination'}), 400
        
        # Verificar se o passageiro existe
        passenger = User.query.get(data['passenger_id'])
        if not passenger or passenger.user_type != 'passenger':
            return jsonify({'error': 'Passageiro não encontrado'}), 404
        
        # Criar nova corrida
        ride = Ride(
            passenger_id=data['passenger_id'],
            origin=data['origin'],
            destination=data['destination'],
            status='requested'
        )
        
        db.session.add(ride)
        db.session.commit()
        
        return jsonify(ride.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@ride_bp.route('/rides/<int:ride_id>/accept', methods=['POST'])
def accept_ride(ride_id):
    """Motorista aceita uma corrida"""
    try:
        data = request.get_json()
        
        if 'driver_id' not in data:
            return jsonify({'error': 'driver_id é obrigatório'}), 400
        
        # Verificar se o motorista existe
        driver = User.query.get(data['driver_id'])
        if not driver or driver.user_type != 'driver':
            return jsonify({'error': 'Motorista não encontrado'}), 404
        
        # Buscar a corrida
        ride = Ride.query.get(ride_id)
        if not ride:
            return jsonify({'error': 'Corrida não encontrada'}), 404
        
        if ride.status != 'requested':
            return jsonify({'error': 'Corrida não está disponível para aceitar'}), 400
        
        # Aceitar a corrida
        ride.driver_id = data['driver_id']
        ride.status = 'accepted'
        
        db.session.commit()
        
        return jsonify(ride.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@ride_bp.route('/rides/<int:ride_id>/status', methods=['PUT'])
def update_ride_status(ride_id):
    """Atualizar status da corrida"""
    try:
        data = request.get_json()
        
        if 'status' not in data:
            return jsonify({'error': 'status é obrigatório'}), 400
        
        valid_statuses = ['requested', 'accepted', 'in_progress', 'completed', 'cancelled']
        if data['status'] not in valid_statuses:
            return jsonify({'error': f'Status deve ser um de: {valid_statuses}'}), 400
        
        ride = Ride.query.get(ride_id)
        if not ride:
            return jsonify({'error': 'Corrida não encontrada'}), 404
        
        ride.status = data['status']
        db.session.commit()
        
        return jsonify(ride.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@ride_bp.route('/rides', methods=['GET'])
def get_rides():
    """Listar corridas com filtros opcionais"""
    try:
        # Filtros opcionais
        passenger_id = request.args.get('passenger_id', type=int)
        driver_id = request.args.get('driver_id', type=int)
        status = request.args.get('status')
        
        query = Ride.query
        
        if passenger_id:
            query = query.filter_by(passenger_id=passenger_id)
        if driver_id:
            query = query.filter_by(driver_id=driver_id)
        if status:
            query = query.filter_by(status=status)
        
        rides = query.order_by(Ride.created_at.desc()).all()
        
        return jsonify([ride.to_dict() for ride in rides]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ride_bp.route('/rides/<int:ride_id>', methods=['GET'])
def get_ride(ride_id):
    """Obter detalhes de uma corrida específica"""
    try:
        ride = Ride.query.get(ride_id)
        if not ride:
            return jsonify({'error': 'Corrida não encontrada'}), 404
        
        return jsonify(ride.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

