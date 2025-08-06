import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Clock, 
  DollarSign, 
  Car, 
  Navigation,
  LogOut,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const UserDashboard = () => {
  const [rideRequest, setRideRequest] = useState({
    pickup: '',
    destination: '',
    estimatedFare: 0,
    estimatedTime: 0
  });
  const [isRequestingRide, setIsRequestingRide] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se o usuário está logado
    const userType = localStorage.getItem('userType');
    if (userType !== 'user') {
      navigate('/');
      return;
    }

    // Simular obtenção da localização atual
    setCurrentLocation('Rua das Flores, 123 - Centro, Rio Pardo/RS');
    setRideRequest(prev => ({
      ...prev,
      pickup: 'Rua das Flores, 123 - Centro, Rio Pardo/RS'
    }));
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRideRequest(prev => ({
      ...prev,
      [name]: value
    }));

    // Simular cálculo de tarifa e tempo quando o destino é preenchido
    if (name === 'destination' && value.length > 10) {
      setRideRequest(prev => ({
        ...prev,
        estimatedFare: Math.random() * 20 + 10, // Entre R$ 10 e R$ 30
        estimatedTime: Math.floor(Math.random() * 15 + 5) // Entre 5 e 20 minutos
      }));
    }
  };

  const handleRequestRide = () => {
    if (!rideRequest.destination) {
      alert('Por favor, informe o destino da corrida');
      return;
    }

    setIsRequestingRide(true);
    
    // Simular busca por motorista
    setTimeout(() => {
      alert('Corrida solicitada! Um motorista foi encontrado e está a caminho.');
      setIsRequestingRide(false);
      // Reset form
      setRideRequest({
        pickup: currentLocation,
        destination: '',
        estimatedFare: 0,
        estimatedTime: 0
      });
    }, 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  const handleSwitchToDriver = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="bg-purple-600 p-2 rounded-full mr-3">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Olá, João!</h1>
                <p className="text-sm text-gray-600">Para onde vamos hoje?</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleSwitchToDriver}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                <Car className="h-4 w-4 mr-2" />
                Modo Motorista
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Solicitar Corrida */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Navigation className="h-5 w-5 mr-2" />
              Solicitar Corrida
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Localização Atual */}
            <div className="space-y-2">
              <Label htmlFor="pickup">De onde você está saindo?</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-green-600" />
                <Input
                  id="pickup"
                  name="pickup"
                  value={rideRequest.pickup}
                  onChange={handleInputChange}
                  placeholder="Localização atual"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Destino */}
            <div className="space-y-2">
              <Label htmlFor="destination">Para onde você quer ir?</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-red-600" />
                <Input
                  id="destination"
                  name="destination"
                  value={rideRequest.destination}
                  onChange={handleInputChange}
                  placeholder="Digite o destino"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Estimativas */}
            {rideRequest.destination && rideRequest.estimatedFare > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Estimativa da Corrida</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Preço estimado</p>
                      <p className="font-semibold">R$ {rideRequest.estimatedFare.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Tempo estimado</p>
                      <p className="font-semibold">{rideRequest.estimatedTime} min</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botão Solicitar */}
            <Button
              onClick={handleRequestRide}
              disabled={isRequestingRide || !rideRequest.destination}
              className="w-full bg-purple-600 hover:bg-purple-700 py-3 text-lg"
            >
              {isRequestingRide ? (
                <>
                  <Search className="h-5 w-5 mr-2 animate-spin" />
                  Procurando motorista...
                </>
              ) : (
                <>
                  <Car className="h-5 w-5 mr-2" />
                  Solicitar Corrida
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Destinos Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Destinos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                'Shopping Rio Pardo - Zona Sul',
                'Hospital Municipal - Centro',
                'Universidade Federal - Campus',
                'Aeroporto Regional - Zona Norte'
              ].map((destination, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setRideRequest(prev => ({ ...prev, destination }))}
                >
                  <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-gray-700">{destination}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;

