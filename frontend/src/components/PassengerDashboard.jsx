import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { MapPin, Car, MessageCircle, Clock } from 'lucide-react';
import ChatComponent from './ChatComponent.jsx';
import MapComponent from './MapComponent.jsx';
import RouteManager from './RouteManager.jsx';

const PassengerDashboard = ({ user }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [currentRide, setCurrentRide] = useState(null);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [driverDistance, setDriverDistance] = useState(null);

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
    if (user) {
      fetchRides();
    }
  }, [user]);

  const fetchRides = async () => {
    try {
      const response = await fetch(`${API_BASE}/rides?passenger_id=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setRides(data);

        // Encontrar corrida ativa
        const activeRide = data.find(ride => 
          ['requested', 'accepted', 'in_progress'].includes(ride.status)
        );
        setCurrentRide(activeRide);
      }
    } catch (error) {
      console.error('Erro ao buscar corridas:', error);
    }
  };

  const requestRide = async () => {
    if (!origin || !destination) {
      alert('Por favor, preencha origem e destino');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/rides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passenger_id: user.id,
          origin,
          destination,
        }),
      });

      if (response.ok) {
        const newRide = await response.json();
        setCurrentRide(newRide);
        setRides([newRide, ...rides]);
        setOrigin('');
        setDestination('');
        alert('Corrida solicitada com sucesso!');
      } else {
        const error = await response.json();
        alert(`Erro: ${error.error}`);
      }
    } catch (error) {
      console.error('Erro ao solicitar corrida:', error);
      alert('Erro ao solicitar corrida');
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
      requested: 'Procurando motorista',
      accepted: 'Motorista a caminho',
      in_progress: 'Em corrida',
      completed: 'Concluída',
      cancelled: 'Cancelada',
    };
    return texts[status] || status;
  };

  // Callback para atualização de rota
  const handleRouteUpdate = (updatedRide) => {
    setCurrentRide(updatedRide);
    // Atualizar também na lista de corridas
    setRides(rides.map(ride => 
      ride.id === updatedRide.id ? updatedRide : ride
    ));
  };

  // Callback para quando a distância é calculada
  const handleDistanceCalculated = (distanceData) => {
    setDriverDistance(distanceData.driver_to_destination);
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Olá, {user?.username}!
        </h1>
        <p className="text-gray-600">Para onde você quer ir hoje?</p>
      </div>

      {/* Solicitar Nova Corrida */}
      {!currentRide && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Solicitar Corrida
            </CardTitle>
            <CardDescription>
              Informe sua origem e destino para encontrar um motorista
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Origem</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="De onde você está saindo?"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Destino</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Para onde você quer ir?"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button 
              onClick={requestRide} 
              disabled={loading || !origin || !destination}
              className="w-full"
            >
              {loading ? 'Solicitando...' : 'Solicitar Corrida'}
            </Button>
          </CardContent>
        </Card>
      )}

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

            {currentRide.driver && (
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-2">Motorista</p>
                <p className="text-lg font-semibold">{currentRide.driver.username}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setShowChat(true)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Conversar
                </Button>
              </div>
            )}

            <div className="text-sm text-gray-500 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Solicitada em {new Date(currentRide.created_at).toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gerenciador de Rota */}
      {currentRide && (
        <RouteManager 
          currentUser={user}
          ride={currentRide}
          onRouteUpdate={handleRouteUpdate}
          onDistanceCalculated={handleDistanceCalculated}
        />
      )}

      {/* Mapa GPS */}
      {currentRide && (
        <MapComponent 
          currentUser={user}
          ride={currentRide}
          showCurrentLocation={true}
          height="500px"
          routeData={routeData}
        />
      )}

      {/* Histórico de Corridas */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Corridas</CardTitle>
          <CardDescription>
            Suas corridas anteriores
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rides.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhuma corrida encontrada
            </p>
          ) : (
            <div className="space-y-3">
              {rides.slice(0, 5).map((ride) => (
                <div 
                  key={ride.id} 
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">
                      {ride.origin} → {ride.destination}
                    </p>
                    <p className="text-sm text-gray-500">
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
  );
};

export default PassengerDashboard;
