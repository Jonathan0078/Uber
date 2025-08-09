import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Star, ArrowRight, Navigation, Car, CreditCard, User } from 'lucide-react';
import MobileBottomNav from './MobileBottomNav';
import MapComponent from './MapComponent';
import '../styles/mobile-native.css';
import RideRequest from './RideRequest';

const MobilePassengerDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentRide, setCurrentRide] = useState(null); // Para gerenciar a corrida atual
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

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
      const response = await fetch(`${API_BASE}/rides?passenger_id=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setRides(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));

        // Verificar se há corrida ativa
        const activeRide = data.find(ride => 
          ride.status === 'requested' || 
          ride.status === 'accepted' || 
          ride.status === 'in_progress'
        );
        if (activeRide && !currentRide) {
          setCurrentRide(activeRide);
        }
      } else {
        console.log('Nenhuma corrida encontrada ou erro na API');
        setRides([]);
      }
    } catch (error) {
      console.error('Erro ao buscar corridas:', error);
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/users/${user.id}`, {
        method: 'DELETE'
      });

      if (response.ok || response.status === 404) {
        alert('Conta excluída com sucesso!');
        onLogout();
      } else {
        alert('Erro ao excluir conta');
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert('Conta excluída localmente');
      onLogout();
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

  const requestRide = async () => {
    if (!origin?.trim() || !destination?.trim()) {
      alert('Por favor, preencha origem e destino');
      return;
    }

    if (origin.trim() === destination.trim()) {
      alert('Origem e destino não podem ser iguais');
      return;
    }

    setLoading(true);
    try {
      // Tentar obter localização atual
      let userLocation = null;
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000
            });
          });
          
          userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };

          // Atualizar localização do usuário no backend
          await fetch(`${API_BASE}/users/${user.id}/location`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userLocation)
          }).catch(err => console.log('Erro ao atualizar localização:', err));

        } catch (geoError) {
          console.log('Erro de geolocalização:', geoError);
        }
      }

      // Criar corrida
      const rideData = {
        passenger_id: user.id,
        origin: origin.trim(),
        destination: destination.trim()
      };

      if (userLocation) {
        rideData.origin_lat = userLocation.latitude;
        rideData.origin_lng = userLocation.longitude;
      }

      const response = await fetch(`${API_BASE}/rides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rideData)
      });

      if (response.ok) {
        const ride = await response.json();
        setCurrentRide(ride);
        setActiveTab('map');
        setOrigin('');
        setDestination('');
        alert('✅ Corrida solicitada com sucesso! Procurando motorista...');
        fetchRides();
      } else {
        const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        alert(`❌ Erro ao solicitar corrida: ${error.error}`);
      }
    } catch (error) {
      console.error('Erro ao solicitar corrida:', error);
      alert('❌ Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderHomeTab = () => (
    <div className="mobile-content">
      <div className="mobile-card">
        <h3 style={{
          fontSize: '24px',
          fontWeight: '700',
          margin: '0 0 8px 0',
          color: 'var(--text-primary)'
        }}>
          Olá, {user.username}! 👋
        </h3>
        <p style={{
          color: 'var(--text-secondary)',
          margin: '0 0 24px 0',
          fontSize: '16px'
        }}>
          Para onde vamos hoje?
        </p>

        <RideRequest 
          user={user} 
          onRideCreated={() => {
            setActiveTab('trips');
            fetchRides();
          }} 
          setOrigin={setOrigin}
          setDestination={setDestination}
          requestRide={requestRide}
          loading={loading}
        />
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
              <h4 className="user-name">Corrida Padrão</h4>
              <p className="user-email">Transporte econômico</p>
              <p className="user-type">Tarifa calculada em tempo real</p>
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={32} style={{ color: 'white' }} />
          </div>
          <div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              margin: '0 0 4px 0',
              color: 'var(--text-primary)'
            }}>
              {user.username}
            </h3>
            <p style={{
              fontSize: '16px',
              color: 'var(--text-secondary)',
              margin: '0'
            }}>
              {user.email}
            </p>
          </div>
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
          style={{ marginTop: '24px', marginBottom: '12px' }}
        >
          Sair da Conta
        </button>
        <button 
          className="mobile-button-secondary"
          onClick={handleDeleteUser}
          style={{ background: '#EF4444', color: 'white' }}
        >
          Excluir Conta
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
          Mapa - Localização Atual
        </h3>
        <MapComponent
          currentUser={user}
          ride={currentRide}
          height="350px"
          showCurrentLocation={true}
        />
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
