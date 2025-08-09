from flask import Blueprint, request, jsonify
from src.models.user import db, User
from src.models.ride import Ride
from src.models.message import Message
from src.services.routing import OSRMRoutingService, format_distance, format_duration

ride_bp = Blueprint('ride', __name__)
routing_service = OSRMRoutingService()

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
            origin_lat=data.get('origin_lat'),
            origin_lng=data.get('origin_lng'),
            destination_lat=data.get('destination_lat'),
            destination_lng=data.get('destination_lng'),
            status='requested'
        )
        
        # Adicionar waypoints se fornecidos
        if 'waypoints' in data:
            ride.set_waypoints(data['waypoints'])
        
        db.session.add(ride)
        db.session.commit()
        
        return jsonify(ride.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@ride_bp.route('/rides/<int:ride_id>/route', methods=['PUT'])
def update_ride_route(ride_id):
    """Atualizar rota da corrida (adicionar/remover destinos)"""
    try:
        data = request.get_json()
        
        ride = Ride.query.get(ride_id)
        if not ride:
            return jsonify({'error': 'Corrida não encontrada'}), 404
        
        # Atualizar origem se fornecida
        if 'origin' in data:
            ride.origin = data['origin']
        if 'origin_lat' in data and 'origin_lng' in data:
            ride.origin_lat = data['origin_lat']
            ride.origin_lng = data['origin_lng']
        
        # Atualizar destino se fornecido
        if 'destination' in data:
            ride.destination = data['destination']
        if 'destination_lat' in data and 'destination_lng' in data:
            ride.destination_lat = data['destination_lat']
            ride.destination_lng = data['destination_lng']
        
        # Atualizar waypoints se fornecidos
        if 'waypoints' in data:
            ride.set_waypoints(data['waypoints'])
        
        db.session.commit()
        
        return jsonify(ride.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@ride_bp.route('/rides/<int:ride_id>/calculate-route', methods=['POST'])
def calculate_ride_route(ride_id):
    """Calcular rota da corrida usando OSRM"""
    try:
        ride = Ride.query.get(ride_id)
        if not ride:
            return jsonify({'error': 'Corrida não encontrada'}), 404
        
        # Verificar se temos coordenadas
        if not all([ride.origin_lat, ride.origin_lng, ride.destination_lat, ride.destination_lng]):
            return jsonify({'error': 'Coordenadas de origem e destino são obrigatórias'}), 400
        
        # Montar lista de coordenadas (longitude, latitude para OSRM)
        coordinates = [(ride.origin_lng, ride.origin_lat)]
        
        # Adicionar waypoints se existirem
        waypoints = ride.get_waypoints()
        for waypoint in waypoints:
            if 'lng' in waypoint and 'lat' in waypoint:
                coordinates.append((waypoint['lng'], waypoint['lat']))
        
        # Adicionar destino
        coordinates.append((ride.destination_lng, ride.destination_lat))
        
        # Calcular rota
        route_data = routing_service.calculate_route(coordinates)
        
        if not route_data:
            return jsonify({'error': 'Não foi possível calcular a rota'}), 500
        
        # Formatar resposta
        response = {
            'ride_id': ride_id,
            'route': route_data,
            'formatted_distance': format_distance(route_data['distance']),
            'formatted_duration': format_duration(route_data['duration']),
            'coordinates': coordinates
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ride_bp.route('/rides/<int:ride_id>/distance-to-driver', methods=['POST'])
def calculate_distance_to_driver(ride_id):
    """Calcular distância do motorista ao destino da corrida"""
    try:
        data = request.get_json()
        
        ride = Ride.query.get(ride_id)
        if not ride:
            return jsonify({'error': 'Corrida não encontrada'}), 404
        
        if not ride.driver_id:
            return jsonify({'error': 'Corrida não possui motorista'}), 400
        
        # Coordenadas do motorista (vindas do frontend)
        driver_lat = data.get('driver_lat')
        driver_lng = data.get('driver_lng')
        
        if not driver_lat or not driver_lng:
            return jsonify({'error': 'Coordenadas do motorista são obrigatórias'}), 400
        
        # Verificar se temos coordenadas do destino
        if not ride.destination_lat or not ride.destination_lng:
            return jsonify({'error': 'Coordenadas do destino não encontradas'}), 400
        
        # Calcular rota do motorista ao destino
        coordinates = [
            (driver_lng, driver_lat),
            (ride.destination_lng, ride.destination_lat)
        ]
        
        route_data = routing_service.calculate_route(coordinates)
        
        if not route_data:
            return jsonify({'error': 'Não foi possível calcular a distância'}), 500
        
        response = {
            'ride_id': ride_id,
            'driver_to_destination': {
                'distance': route_data['distance'],
                'duration': route_data['duration'],
                'formatted_distance': format_distance(route_data['distance']),
                'formatted_duration': format_duration(route_data['duration']),
                'geometry': route_data['geometry']
            }
        }
        
        return jsonify(response), 200
        
    except Exception as e:
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

