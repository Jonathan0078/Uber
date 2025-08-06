import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, 
  MapPin, 
  Clock, 
  DollarSign, 
  User, 
  Phone, 
  Navigation,
  CheckCircle,
  XCircle,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const DriverDashboard = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [rides, setRides] = useState([]);
  const [stats, setStats] = useState({
    todayEarnings: 0,
    todayRides: 0,
    rating: 4.8,
    totalRides: 0
  });
  const navigate = useNavigate();

  // Dados simulados de corridas
  const mockRides = [
    {
      id: 1,
      passenger: {
        name: 'João Silva',
        phone: '(51) 99999-1234',
        rating: 4.9
      },
      pickup: 'Rua das Flores, 123 - Centro',
      destination: 'Shopping Rio Pardo - Zona Sul',
      distance: '3.2 km',
      estimatedTime: '12 min',
      fare: 15.50,
      status: 'pending',
      requestTime: '14:30'
    },
    {
      id: 2,
      passenger: {
        name: 'Maria Santos',
        phone: '(51) 98888-5678',
        rating: 4.7
      },
      pickup: 'Av. Independência, 456 - Bairro Novo',
      destination: 'Hospital Municipal - Centro',
      distance: '2.8 km',
      estimatedTime: '10 min',
      fare: 12.00,
      status: 'pending',
      requestTime: '14:45'
    }
  ];

  useEffect(() => {
    // Verificar se o usuário está logado como motorista
    const userType = localStorage.getItem('userType');
    if (userType !== 'driver') {
      navigate('/');
      return;
    }

    // Simular carregamento de dados
    setStats({
      todayEarnings: 127.50,
      todayRides: 8,
      rating: 4.8,
      totalRides: 342
    });

    // Simular chegada de corridas quando online
    if (isOnline) {
      setRides(mockRides);
    } else {
      setRides([]);
    }
  }, [isOnline, navigate]);

  const handleToggleOnline = () => {
    setIsOnline(!isOnline);
  };

  const handleAcceptRide = (rideId) => {
    setRides(rides.filter(ride => ride.id !== rideId));
    alert('Corrida aceita! Dirija-se ao local de embarque.');
  };

  const handleRejectRide = (rideId) => {
    setRides(rides.filter(ride => ride.id !== rideId));
  };

  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  const handleSwitchToUser = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="bg-green-600 p-2 rounded-full mr-3">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard Motorista</h1>
                <p className="text-sm text-gray-600">Uber Rio Pardo</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleSwitchToUser}
                className="text-purple-600 border-purple-600 hover:bg-purple-50"
              >
                <User className="h-4 w-4 mr-2" />
                Modo Usuário
              </Button>
              
              <Button
                variant="outline"
                onClick={handleLogout}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Online/Offline */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-3 ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <div>
                  <h3 className="text-lg font-semibold">
                    Status: {isOnline ? 'Online' : 'Offline'}
                  </h3>
                  <p className="text-gray-600">
                    {isOnline ? 'Você está disponível para receber corridas' : 'Você está offline'}
                  </p>
                </div>
              </div>
              
              <Button
                onClick={handleToggleOnline}
                className={`px-6 py-2 ${
                  isOnline 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isOnline ? 'Ficar Offline' : 'Ficar Online'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ganhos Hoje</p>
                  <p className="text-2xl font-bold text-gray-900">R$ {stats.todayEarnings.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Car className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Corridas Hoje</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.todayRides}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avaliação</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.rating} ⭐</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <RefreshCw className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Corridas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRides}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Solicitações de Corrida */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Navigation className="h-5 w-5 mr-2" />
              Solicitações de Corrida
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isOnline ? (
              <div className="text-center py-8">
                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Fique online para receber solicitações de corrida</p>
              </div>
            ) : rides.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aguardando solicitações de corrida...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rides.map((ride) => (
                  <Card key={ride.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <div className="bg-gray-100 p-2 rounded-full mr-3">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{ride.passenger.name}</h4>
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-4 w-4 mr-1" />
                              {ride.passenger.phone}
                              <span className="ml-2">⭐ {ride.passenger.rating}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <Badge variant="secondary">{ride.requestTime}</Badge>
                          <p className="text-lg font-bold text-green-600 mt-1">R$ {ride.fare.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Embarque</p>
                            <p className="text-sm text-gray-600">{ride.pickup}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Destino</p>
                            <p className="text-sm text-gray-600">{ride.destination}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          {ride.estimatedTime} • {ride.distance}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectRide(ride.id)}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Recusar
                          </Button>
                          
                          <Button
                            size="sm"
                            onClick={() => handleAcceptRide(ride.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aceitar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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

