import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { MapPin, Car, MessageCircle, Clock, CheckCircle, XCircle, Play, Square } from 'lucide-react';
import ChatComponent from './ChatComponent.jsx';

const DriverDashboard = ({ user }) => {
  const [isAvailable, setIsAvailable] = useState(user?.is_available || false);
  const [availableRides, setAvailableRides] = useState([]);
  const [currentRide, setCurrentRide] = useState(null);
  const [myRides, setMyRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // API Base URL
  const API_BASE = window.location.hostname === 'localhost' 
    ? '/api' 
    : 'https://JonathanOliveira.pythonanywhere.com/api';

  useEffect(() => {
    if (user) {
      fetchAvailableRides();
      fetchMyRides();
    }
  }, [user]);

  useEffect(() => {
    // Atualizar dados a cada 10 segundos
    const interval = setInterval(() => {
      if (user) {
        fetchAvailableRides();
        fetchMyRides();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  const fetchAvailableRides = async () => {
    try {
      const response = await fetch(`${API_BASE}/rides?status=requested`);
      if (response.ok) {
        const data = await response.json();
        setAvailableRides(data);
      }
    } catch (error) {
      console.error('Erro ao buscar corridas disponíveis:', error);
    }
  };

  const fetchMyRides = async () => {
    try {
      const response = await fetch(`${API_BASE}/rides?driver_id=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setMyRides(data);
        
        // Encontrar corrida ativa
        const activeRide = data.find(ride => 
          ['accepted', 'in_progress'].includes(ride.status)
        );
        setCurrentRide(activeRide);
      }
    } catch (error) {
      console.error('Erro ao buscar minhas corridas:', error);
    }
  };

  const toggleAvailability = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_available: !isAvailable,
        }),
      });

      if (response.ok) {
        setIsAvailable(!isAvailable);
        user.is_available = !isAvailable;
      } else {
        alert('Erro ao atualizar disponibilidade');
      }
    } catch (error) {
      console.error('Erro ao atualizar disponibilidade:', error);
      alert('Erro ao atualizar disponibilidade');
    } finally {
      setLoading(false);
    }
  };

  const acceptRide = async (rideId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/rides/${rideId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          driver_id: user.id,
        }),
      });

      if (response.ok) {
        const acceptedRide = await response.json();
        setCurrentRide(acceptedRide);
        setMyRides([acceptedRide, ...myRides]);
        fetchAvailableRides(); // Atualizar lista de corridas disponíveis
        alert('Corrida aceita com sucesso!');
      } else {
        const error = await response.json();
        alert(`Erro: ${error.error}`);
      }
    } catch (error) {
      console.error('Erro ao aceitar corrida:', error);
      alert('Erro ao aceitar corrida');
    } finally {
      setLoading(false);
    }
  };

  const updateRideStatus = async (rideId, newStatus) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/rides/${rideId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (response.ok) {
        const updatedRide = await response.json();
        setCurrentRide(newStatus === 'completed' ? null : updatedRide);
        fetchMyRides();
        alert(`Status atualizado para: ${getStatusText(newStatus)}`);
      } else {
        const error = await response.json();
        alert(`Erro: ${error.error}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      requested: 'bg-yellow-500',
      accepted: 'bg-blue-500',
      in_progress: 'bg-green-500',
      completed: 'bg-gray-500',
      cancelled: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusText = (status) => {
    const texts = {
      requested: 'Solicitada',
      accepted: 'Aceita',
      in_progress: 'Em andamento',
      completed: 'Concluída',
      cancelled: 'Cancelada',
    };
    return texts[status] || status;
  };

  if (showChat && currentRide) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <ChatComponent 
          ride={currentRide} 
          currentUser={user}
          onClose={() => setShowChat(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard do Motorista
        </h1>
        <p className="text-gray-600">Olá, {user?.username}!</p>
      </div>

      {/* Status de Disponibilidade */}
      <Card className={isAvailable ? 'border-green-200 bg-green-50' : 'border-gray-200'}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Status de Disponibilidade
            </span>
            <Badge className={isAvailable ? 'bg-green-500' : 'bg-gray-500'}>
              {isAvailable ? 'Disponível' : 'Indisponível'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              {isAvailable 
                ? 'Você está disponível para receber corridas' 
                : 'Você está indisponível. Ative para receber corridas'
              }
            </p>
            <Button 
              onClick={toggleAvailability}
              disabled={loading}
              variant={isAvailable ? 'destructive' : 'default'}
            >
              {isAvailable ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Ficar Indisponível
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Ficar Disponível
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Corrida Atual */}
      {currentRide && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Corrida Atual
              </span>
              <Badge className={getStatusColor(currentRide.status)}>
                {getStatusText(currentRide.status)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Origem</p>
                <p className="text-lg">{currentRide.origin}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Destino</p>
                <p className="text-lg">{currentRide.destination}</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-2">Passageiro</p>
              <p className="text-lg font-semibold">{currentRide.passenger.username}</p>
              <p className="text-sm text-gray-500">{currentRide.passenger.email}</p>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {currentRide.status === 'accepted' && (
                <Button 
                  onClick={() => updateRideStatus(currentRide.id, 'in_progress')}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Corrida
                </Button>
              )}
              
              {currentRide.status === 'in_progress' && (
                <Button 
                  onClick={() => updateRideStatus(currentRide.id, 'completed')}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Finalizar Corrida
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowChat(true)}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Conversar
              </Button>
            </div>
            
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Aceita em {new Date(currentRide.updated_at).toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Corridas Disponíveis */}
        <Card>
          <CardHeader>
            <CardTitle>Corridas Disponíveis</CardTitle>
            <CardDescription>
              Corridas aguardando motorista
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isAvailable ? (
              <p className="text-gray-500 text-center py-8">
                Ative sua disponibilidade para ver corridas
              </p>
            ) : availableRides.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhuma corrida disponível no momento
              </p>
            ) : (
              <div className="space-y-3">
                {availableRides.slice(0, 5).map((ride) => (
                  <div 
                    key={ride.id} 
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div>
                      <p className="font-medium">
                        {ride.origin} → {ride.destination}
                      </p>
                      <p className="text-sm text-gray-500">
                        Passageiro: {ride.passenger.username}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(ride.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <Button 
                      onClick={() => acceptRide(ride.id)}
                      disabled={loading || currentRide}
                      size="sm"
                      className="w-full"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aceitar Corrida
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Histórico de Corridas */}
        <Card>
          <CardHeader>
            <CardTitle>Minhas Corridas</CardTitle>
            <CardDescription>
              Histórico das suas corridas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {myRides.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhuma corrida encontrada
              </p>
            ) : (
              <div className="space-y-3">
                {myRides.slice(0, 5).map((ride) => (
                  <div 
                    key={ride.id} 
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {ride.origin} → {ride.destination}
                      </p>
                      <p className="text-sm text-gray-500">
                        {ride.passenger.username}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(ride.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Badge className={getStatusColor(ride.status)}>
                      {getStatusText(ride.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DriverDashboard;

