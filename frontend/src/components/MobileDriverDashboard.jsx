import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Star, ArrowRight, Car, DollarSign, ToggleLeft, ToggleRight, User } from 'lucide-react';
import MobileBottomNav from './MobileBottomNav';
import '../styles/mobile-native.css';

const MobileDriverDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(user.is_available || false);

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
    if (activeTab === 'rides') {
      fetchRides();
    }
  }, [activeTab]);

  const fetchRides = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/rides/driver/${user.id}`);
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
          passenger: { username: 'Ana Silva' }
        },
        {
          id: 2,
          pickup_location: 'Centro da Cidade',
          destination: 'Universidade',
          status: 'completed',
          fare: 15.80,
          created_at: '2024-01-14T14:20:00Z',
          passenger: { username: 'Carlos Santos' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      const response = await fetch(`${API_BASE}/drivers/${user.id}/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_available: !isAvailable }),
      });

      if (response.ok) {
        setIsAvailable(!isAvailable);
      }
    } catch (error) {
      console.error('Erro ao alterar disponibilidade:', error);
      // Para demonstração, alterar localmente
      setIsAvailable(!isAvailable);
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
      {/* Status do motorista */}
      <div className="mobile-card">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div>
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
              color: isAvailable ? 'var(--primary-green)' : 'var(--text-secondary)', 
              margin: 0,
              fontWeight: '600'
            }}>
              {isAvailable ? 'Você está online' : 'Você está offline'}
            </p>
          </div>
          <button
            onClick={toggleAvailability}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            {isAvailable ? (
              <ToggleRight size={40} style={{ color: 'var(--primary-green)' }} />
            ) : (
              <ToggleLeft size={40} style={{ color: 'var(--text-secondary)' }} />
            )}
          </button>
        </div>
        
        <div style={{ 
          padding: '16px',
          background: isAvailable ? 'rgba(0, 212, 170, 0.1)' : 'var(--secondary-gray)',
          borderRadius: 'var(--radius-mobile)',
          textAlign: 'center'
        }}>
          <p style={{ 
            margin: 0,
            color: isAvailable ? 'var(--primary-green)' : 'var(--text-secondary)',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {isAvailable 
              ? 'Procurando por passageiros próximos...' 
              : 'Toque no botão acima para ficar online'
            }
          </p>
        </div>
      </div>

      {/* Estatísticas do dia */}
      <div className="mobile-card">
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          margin: '0 0 16px 0',
          color: 'var(--text-primary)'
        }}>
          Estatísticas de Hoje
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '16px' 
        }}>
          <div style={{ 
            textAlign: 'center',
            padding: '16px',
            background: 'var(--secondary-gray)',
            borderRadius: 'var(--radius-mobile)'
          }}>
            <DollarSign size={24} style={{ 
              color: 'var(--primary-green)', 
              margin: '0 auto 8px' 
            }} />
            <h4 style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              margin: '0 0 4px 0',
              color: 'var(--text-primary)'
            }}>
              R$ 127,50
            </h4>
            <p style={{ 
              fontSize: '12px', 
              color: 'var(--text-secondary)', 
              margin: 0 
            }}>
              Ganhos
            </p>
          </div>

          <div style={{ 
            textAlign: 'center',
            padding: '16px',
            background: 'var(--secondary-gray)',
            borderRadius: 'var(--radius-mobile)'
          }}>
            <Car size={24} style={{ 
              color: 'var(--primary-green)', 
              margin: '0 auto 8px' 
            }} />
            <h4 style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              margin: '0 0 4px 0',
              color: 'var(--text-primary)'
            }}>
              8
            </h4>
            <p style={{ 
              fontSize: '12px', 
              color: 'var(--text-secondary)', 
              margin: 0 
            }}>
              Corridas
            </p>
          </div>

          <div style={{ 
            textAlign: 'center',
            padding: '16px',
            background: 'var(--secondary-gray)',
            borderRadius: 'var(--radius-mobile)'
          }}>
            <Clock size={24} style={{ 
              color: 'var(--primary-green)', 
              margin: '0 auto 8px' 
            }} />
            <h4 style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              margin: '0 0 4px 0',
              color: 'var(--text-primary)'
            }}>
              6h 30m
            </h4>
            <p style={{ 
              fontSize: '12px', 
              color: 'var(--text-secondary)', 
              margin: 0 
            }}>
              Online
            </p>
          </div>

          <div style={{ 
            textAlign: 'center',
            padding: '16px',
            background: 'var(--secondary-gray)',
            borderRadius: 'var(--radius-mobile)'
          }}>
            <Star size={24} style={{ 
              color: '#F59E0B', 
              margin: '0 auto 8px' 
            }} />
            <h4 style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              margin: '0 0 4px 0',
              color: 'var(--text-primary)'
            }}>
              4.9
            </h4>
            <p style={{ 
              fontSize: '12px', 
              color: 'var(--text-secondary)', 
              margin: 0 
            }}>
              Avaliação
            </p>
          </div>
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="mobile-card">
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          margin: '0 0 16px 0',
          color: 'var(--text-primary)'
        }}>
          Ações Rápidas
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="user-card">
            <DollarSign size={24} style={{ color: 'var(--primary-green)' }} />
            <div className="user-info">
              <h4 className="user-name">Ganhos da Semana</h4>
              <p className="user-email">Ver relatório detalhado</p>
            </div>
            <ArrowRight size={20} style={{ color: 'var(--text-secondary)' }} />
          </div>

          <div className="user-card">
            <Car size={24} style={{ color: 'var(--text-secondary)' }} />
            <div className="user-info">
              <h4 className="user-name">Meu Veículo</h4>
              <p className="user-email">Gerenciar informações do carro</p>
            </div>
            <ArrowRight size={20} style={{ color: 'var(--text-secondary)' }} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderRidesTab = () => (
    <div className="mobile-content">
      <div className="mobile-card">
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          margin: '0 0 16px 0',
          color: 'var(--text-primary)'
        }}>
          Suas Corridas
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
            <Car size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p style={{ margin: 0, fontSize: '16px' }}>
              Nenhuma corrida encontrada
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
                  <Car size={24} style={{ color: 'white' }} />
                </div>
                <div className="user-info">
                  <h4 className="user-name">{ride.pickup_location}</h4>
                  <p className="user-email">→ {ride.destination}</p>
                  <p className="user-type">
                    {formatDate(ride.created_at)} • {ride.passenger?.username}
                  </p>
                </div>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'flex-end',
                  gap: '4px'
                }}>
                  <span style={{ 
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'var(--primary-green)'
                  }}>
                    R$ {ride.fare?.toFixed(2)}
                  </span>
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
          <div style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            marginTop: '8px',
            padding: '4px 12px',
            background: 'rgba(0, 212, 170, 0.1)',
            borderRadius: '20px'
          }}>
            <Star size={16} style={{ color: '#F59E0B' }} />
            <span style={{ 
              fontSize: '14px', 
              fontWeight: '600',
              color: 'var(--primary-green)'
            }}>
              4.9
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="user-card">
            <Car size={24} style={{ color: 'var(--primary-green)' }} />
            <div className="user-info">
              <h4 className="user-name">Meu Veículo</h4>
              <p className="user-email">Honda Civic 2020 - ABC-1234</p>
            </div>
            <ArrowRight size={20} style={{ color: 'var(--text-secondary)' }} />
          </div>

          <div className="user-card">
            <DollarSign size={24} style={{ color: 'var(--primary-green)' }} />
            <div className="user-info">
              <h4 className="user-name">Ganhos</h4>
              <p className="user-email">Ver relatórios e histórico</p>
            </div>
            <ArrowRight size={20} style={{ color: 'var(--text-secondary)' }} />
          </div>

          <div className="user-card">
            <Star size={24} style={{ color: '#F59E0B' }} />
            <div className="user-info">
              <h4 className="user-name">Avaliações</h4>
              <p className="user-email">Sua avaliação média: 4.9 ⭐</p>
            </div>
            <ArrowRight size={20} style={{ color: 'var(--text-secondary)' }} />
          </div>

          <div className="user-card">
            <Clock size={24} style={{ color: 'var(--text-secondary)' }} />
            <div className="user-info">
              <h4 className="user-name">Histórico</h4>
              <p className="user-email">Ver todas as suas corridas</p>
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
      case 'rides':
        return renderRidesTab();
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
          <Car size={16} />
          Motorista
        </div>
      </div>

      {/* Conteúdo */}
      {renderContent()}

      {/* Bottom Navigation */}
      <MobileBottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        userType="driver"
      />
    </div>
  );
};

export default MobileDriverDashboard;

