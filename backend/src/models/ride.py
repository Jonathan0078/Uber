from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class Ride(db.Model):
    __tablename__ = 'rides'
    
    id = db.Column(db.Integer, primary_key=True)
    passenger_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    driver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    origin = db.Column(db.String(255), nullable=False)
    destination = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(50), default='requested')  # requested, accepted, in_progress, completed, cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    passenger = db.relationship('User', foreign_keys=[passenger_id], backref='passenger_rides')
    driver = db.relationship('User', foreign_keys=[driver_id], backref='driver_rides')
    
    def to_dict(self):
        return {
            'id': self.id,
            'passenger_id': self.passenger_id,
            'driver_id': self.driver_id,
            'origin': self.origin,
            'destination': self.destination,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'passenger': self.passenger.to_dict() if self.passenger else None,
            'driver': self.driver.to_dict() if self.driver else None
        }

