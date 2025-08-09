from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db
import json

class Ride(db.Model):
    __tablename__ = 'rides'
    
    id = db.Column(db.Integer, primary_key=True)
    passenger_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    driver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    origin = db.Column(db.String(255), nullable=False)
    destination = db.Column(db.String(255), nullable=False)
    
    # Novos campos para coordenadas e múltiplos destinos
    origin_lat = db.Column(db.Float, nullable=True)
    origin_lng = db.Column(db.Float, nullable=True)
    destination_lat = db.Column(db.Float, nullable=True)
    destination_lng = db.Column(db.Float, nullable=True)
    waypoints = db.Column(db.Text, nullable=True)  # JSON string para pontos intermediários
    
    status = db.Column(db.String(50), default='requested')  # requested, accepted, in_progress, completed, cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    passenger = db.relationship('User', foreign_keys=[passenger_id], backref='passenger_rides')
    driver = db.relationship('User', foreign_keys=[driver_id], backref='driver_rides')
    
    def get_waypoints(self):
        """Retorna os waypoints como lista de dicionários"""
        if self.waypoints:
            try:
                return json.loads(self.waypoints)
            except json.JSONDecodeError:
                return []
        return []
    
    def set_waypoints(self, waypoints_list):
        """Define os waypoints a partir de uma lista de dicionários"""
        if waypoints_list:
            self.waypoints = json.dumps(waypoints_list)
        else:
            self.waypoints = None
    
    def to_dict(self):
        return {
            'id': self.id,
            'passenger_id': self.passenger_id,
            'driver_id': self.driver_id,
            'origin': self.origin,
            'destination': self.destination,
            'origin_lat': self.origin_lat,
            'origin_lng': self.origin_lng,
            'destination_lat': self.destination_lat,
            'destination_lng': self.destination_lng,
            'waypoints': self.get_waypoints(),
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'passenger': self.passenger.to_dict() if self.passenger else None,
            'driver': self.driver.to_dict() if self.driver else None
        }

