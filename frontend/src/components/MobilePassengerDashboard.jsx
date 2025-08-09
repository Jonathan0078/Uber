import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Star, ArrowRight, Navigation, Car, CreditCard } from 'lucide-react';
import MobileBottomNav from './MobileBottomNav';
import '../styles/mobile-native.css';

const MobilePassengerDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);

  // API Base URL
  const getApiBase = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
    if (window.location.hostname.includes('replit.dev') || window.location.hostname.includes('replit.app')) {
      return `https://${window.location.hostname}/api`;
    }
    if (window.location.hostname.includes('github.io')) {
      return 'https://JonathanOliveira.pythonanywhere.com/api';
    }
    return 'https://JonathanOliveira.pythonanywhere.com/api';
  };

  const API_BASE = getApiBase();

  useEffect(() => {
    if (activeTab === 'trips') {
      fetchRides();
    }
  }, [activeTab]);

  const fetchRides = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/rides/passenger/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setRides(data);
      }
    } catch (error) {
      console.error('Erro ao buscar corridas:', error);
      // Mock data para demonstração
      setRides([
        {
          id: 1,
          pickup_location: 'Shopping Center',
          destination: 'Aeroporto Internacional',
          status: 'completed',
          fare: 25.50,
          created_at: '2024-01-15T10:30:00Z',
          driver: { username: 'João Silva' }
        },
        {
          id: 2,
          pickup_location: 'Centro da Cidade',
          destination: 'Universidade',
          status: 'completed',
          fare: 15.80,
          created_at: '2024-01-14T14:20:00Z',
          driver: { username: 'Maria Santos' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderHomeTab = () => (
    <div className="mobile-content">
      {/* Saudação */}
      <div className="mobile-card">
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '700', 
          margin: '0 0 8px 0',
          color: 'var(--text-primary)'
        }}>
          Olá, {user.username}! 👋
        </h2>
        <p style={{ 
          fontSize: '16px', 
          color: 'var(--text-secondary)', 
          margin: 0 
        }}>
          Para onde vamos hoje?
        </p>
      </div>

      {/* Ações rápidas */}
      <div className="mobile-card">
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          margin: '0 0 16px 0',
          color: 'var(--text-primary)'
        }}>
          Solicitar Corrida
        </h3>
        
        <div style={{ marginBottom: '16px' }}>
          <label className="form-label">De onde?</label>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            padding: '16px',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-mobile)',
            background: 'var(--secondary-gray)'
          }}>
            <MapPin size={20} style={{ color: 'var(--primary-green)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Localização atual</span>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label className="form-label">Para onde?</label>
          <input
            className="mobile-input"
            placeholder="Digite o destino"
          />
        </div>

        <button className="mobile-button">
          <Navigation size={20} style={{ marginRight: '8px' }} />
          Solicitar Corrida
        </button>
      </div>

      {/* Opções de transporte */}
      <div className="mobile-card">
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          margin: '0 0 16px 0',
          color: 'var(--text-primary)'
        }}>
          Opções de Transporte
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="user-card" style={{ cursor: 'pointer' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px',
              background: 'var(--primary-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Car size={24} style={{ color: 'white' }} />
            </div>
            <div className="user-info">
              <h4 className="user-name">UberX</h4>
              <p className="user-email">Econômico para o dia a dia</p>
              <p className="user-type">A partir de R$ 8,50</p>
            </div>
            <ArrowRight size={20} style={{ color: 'var(--text-secondary)' }} />
          </div>

          <div className="user-card" style={{ cursor: 'pointer' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px',
              background: '#1F2937',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Car size={24} style={{ color: 'white' }} />
            </div>
            <div className="user-info">
              <h4 className="user-name">Uber Black</h4>
              <p className="user-email">Conforto premium</p>
              <p className="user-type">A partir de R$ 15,00</p>
            </div>
            <ArrowRight size={20} style={{ color: 'var(--text-secondary)' }} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderTripsTab = () => (
    <div className="mobile-content">
      <div className="mobile-card">
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          margin: '0 0 16px 0',
          color: 'var(--text-primary)'
        }}>
          Suas Viagens
        </h3>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div className="loading" style={{ position: 'relative', height: '40px' }}></div>
          </div>
        ) : rides.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            color: 'var(--text-secondary)'
          }}>
            <Navigation size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p style={{ margin: 0, fontSize: '16px' }}>
              Nenhuma viagem encontrada
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {rides.map((ride) => (
              <div key={ride.id} className="user-card">
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px',
                  background: ride.status === 'completed' ? 'var(--primary-green)' : '#F59E0B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Navigation size={24} style={{ color: 'white' }} />
                </div>
                <div className="user-info">
                  <h4 className="user-name">{ride.pickup_location}</h4>
                  <p className="user-email">→ {ride.destination}</p>
                  <p className="user-type">
                    {formatDate(ride.created_at)} • R$ {ride.fare?.toFixed(2)}
                  </p>
                </div>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'flex-end',
                  gap: '4px'
                }}>
                  <span style={{ 
                    fontSize: '12px',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    background: ride.status === 'completed' ? 'rgba(0, 212, 170, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: ride.status === 'completed' ? 'var(--primary-green)' : '#F59E0B',
                    fontWeight: '500'
                  }}>
                    {ride.status === 'completed' ? 'Concluída' : 'Em andamento'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={12} style={{ color: '#F59E0B' }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      4.8
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderProfileTab = () => (
    <div className="mobile-content">
      <div className="mobile-card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%',
            background: 'var(--primary-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '32px',
            fontWeight: '700',
            color: 'white'
          }}>
            {user.username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            margin: '0 0 8px 0',
            color: 'var(--text-primary)'
          }}>
            {user.username}
          </h2>
          <p style={{ 
            fontSize: '16px', 
            color: 'var(--text-secondary)', 
            margin: 0 
          }}>
            {user.email}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="user-card">
            <CreditCard size={24} style={{ color: 'var(--primary-green)' }} />
            <div className="user-info">
              <h4 className="user-name">Métodos de Pagamento</h4>
              <p className="user-email">Gerenciar cartões e formas de pagamento</p>
            </div>
            <ArrowRight size={20} style={{ color: 'var(--text-secondary)' }} />
          </div>

          <div className="user-card">
            <Star size={24} style={{ color: '#F59E0B' }} />
            <div className="user-info">
              <h4 className="user-name">Avaliações</h4>
              <p className="user-email">Sua avaliação média: 4.8 ⭐</p>
            </div>
            <ArrowRight size={20} style={{ color: 'var(--text-secondary)' }} />
          </div>

          <div className="user-card">
            <Clock size={24} style={{ color: 'var(--text-secondary)' }} />
            <div className="user-info">
              <h4 className="user-name">Histórico</h4>
              <p className="user-email">Ver todas as suas viagens</p>
            </div>
            <ArrowRight size={20} style={{ color: 'var(--text-secondary)' }} />
          </div>
        </div>

        <button 
          className="mobile-button-secondary"
          onClick={onLogout}
          style={{ marginTop: '24px' }}
        >
          Sair da Conta
        </button>
      </div>
    </div>
  );

  const renderMapTab = () => (
    <div className="mobile-content">
      <div className="mobile-card">
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          margin: '0 0 16px 0',
          color: 'var(--text-primary)'
        }}>
          Mapa
        </h3>
        <div style={{ 
          height: '300px',
          background: 'var(--secondary-gray)',
          borderRadius: 'var(--radius-mobile)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <MapPin size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p style={{ margin: 0 }}>Mapa será carregado aqui</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHomeTab();
      case 'map':
        return renderMapTab();
      case 'trips':
        return renderTripsTab();
      case 'profile':
        return renderProfileTab();
      default:
        return renderHomeTab();
    }
  };

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="mobile-header">
        <h1>Uber App</h1>
        <div style={{ 
          fontSize: '14px', 
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <User size={16} />
          Passageiro
        </div>
      </div>

      {/* Conteúdo */}
      {renderContent()}

      {/* Bottom Navigation */}
      <MobileBottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        userType="passenger"
      />
    </div>
  );
};

export default MobilePassengerDashboard;

