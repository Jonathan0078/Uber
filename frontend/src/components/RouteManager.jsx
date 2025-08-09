import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { MapPin, Plus, Trash2, Navigation, Clock, Route } from 'lucide-react';

const RouteManager = ({ 
  currentUser, 
  ride, 
  onRouteUpdate,
  onDistanceCalculated 
}) => {
  const [destination, setDestination] = useState(ride?.destination || '');
  const [waypoints, setWaypoints] = useState(ride?.waypoints || []);
  const [newWaypoint, setNewWaypoint] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
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

  // Função para geocodificar endereços (simulada)
  const geocodeAddress = async (address) => {
    // Em uma implementação real, você usaria uma API de geocodificação
    // Por agora, vamos simular coordenadas próximas ao centro de São Paulo
    const baseLatitude = -23.5505;
    const baseLongitude = -46.6333;
    
    // Gerar coordenadas aleatórias próximas baseadas no hash do endereço
    const hash = address.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const offsetLat = (hash % 200 - 100) / 10000; // -0.01 a 0.01
    const offsetLng = ((hash * 7) % 200 - 100) / 10000;
    
    return {
      lat: baseLatitude + offsetLat,
      lng: baseLongitude + offsetLng
    };
  };

  // Atualizar destino
  const handleDestinationUpdate = async () => {
    if (!destination.trim() || !ride) return;

    try {
      setIsCalculating(true);
      
      // Geocodificar o novo destino
      const coords = await geocodeAddress(destination);
      
      // Atualizar no backend
      const response = await fetch(`${API_BASE}/rides/${ride.id}/route`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: destination,
          destination_lat: coords.lat,
          destination_lng: coords.lng,
          waypoints: waypoints
        }),
      });

      if (response.ok) {
        const updatedRide = await response.json();
        if (onRouteUpdate) {
          onRouteUpdate(updatedRide);
        }
        await calculateRoute();
      } else {
        console.error('Erro ao atualizar destino');
      }
    } catch (error) {
      console.error('Erro ao atualizar destino:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  // Adicionar waypoint
  const handleAddWaypoint = async () => {
    if (!newWaypoint.trim() || !ride) return;

    try {
      setIsCalculating(true);
      
      // Geocodificar o waypoint
      const coords = await geocodeAddress(newWaypoint);
      
      const newWaypointObj = {
        address: newWaypoint,
        lat: coords.lat,
        lng: coords.lng
      };

      const updatedWaypoints = [...waypoints, newWaypointObj];
      setWaypoints(updatedWaypoints);
      setNewWaypoint('');

      // Atualizar no backend
      const response = await fetch(`${API_BASE}/rides/${ride.id}/route`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          waypoints: updatedWaypoints
        }),
      });

      if (response.ok) {
        const updatedRide = await response.json();
        if (onRouteUpdate) {
          onRouteUpdate(updatedRide);
        }
        await calculateRoute();
      } else {
        console.error('Erro ao adicionar waypoint');
      }
    } catch (error) {
      console.error('Erro ao adicionar waypoint:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  // Remover waypoint
  const handleRemoveWaypoint = async (index) => {
    if (!ride) return;

    try {
      setIsCalculating(true);
      
      const updatedWaypoints = waypoints.filter((_, i) => i !== index);
      setWaypoints(updatedWaypoints);

      // Atualizar no backend
      const response = await fetch(`${API_BASE}/rides/${ride.id}/route`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          waypoints: updatedWaypoints
        }),
      });

      if (response.ok) {
        const updatedRide = await response.json();
        if (onRouteUpdate) {
          onRouteUpdate(updatedRide);
        }
        await calculateRoute();
      } else {
        console.error('Erro ao remover waypoint');
      }
    } catch (error) {
      console.error('Erro ao remover waypoint:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  // Calcular rota completa
  const calculateRoute = async () => {
    if (!ride) return;

    try {
      setIsCalculating(true);
      
      const response = await fetch(`${API_BASE}/rides/${ride.id}/calculate-route`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const routeData = await response.json();
        setRouteInfo(routeData);
      } else {
        console.error('Erro ao calcular rota');
      }
    } catch (error) {
      console.error('Erro ao calcular rota:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  // Calcular distância do motorista
  const calculateDriverDistance = async (driverLocation) => {
    if (!ride || !ride.driver_id || !driverLocation) return;

    try {
      const response = await fetch(`${API_BASE}/rides/${ride.id}/distance-to-driver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          driver_lat: driverLocation.lat,
          driver_lng: driverLocation.lng
        }),
      });

      if (response.ok) {
        const distanceData = await response.json();
        setDriverDistance(distanceData.driver_to_destination);
        if (onDistanceCalculated) {
          onDistanceCalculated(distanceData);
        }
      } else {
        console.error('Erro ao calcular distância do motorista');
      }
    } catch (error) {
      console.error('Erro ao calcular distância do motorista:', error);
    }
  };

  // Atualizar quando a corrida mudar
  useEffect(() => {
    if (ride) {
      setDestination(ride.destination || '');
      setWaypoints(ride.waypoints || []);
    }
  }, [ride]);

  // Calcular rota inicial
  useEffect(() => {
    if (ride && ride.destination_lat && ride.destination_lng) {
      calculateRoute();
    }
  }, [ride]);

  // Só mostrar para passageiros
  if (!currentUser || currentUser.user_type !== 'passenger') {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Route className="h-5 w-5" />
          Gerenciar Rota
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Destino Principal */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Destino Final</label>
          <div className="flex gap-2">
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Digite o endereço de destino"
              className="flex-1"
            />
            <Button 
              onClick={handleDestinationUpdate}
              disabled={isCalculating || !destination.trim()}
              size="sm"
            >
              <MapPin className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Pontos Intermediários */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Pontos Intermediários</label>
          
          {/* Lista de waypoints */}
          {waypoints.length > 0 && (
            <div className="space-y-2">
              {waypoints.map((waypoint, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span className="flex-1 text-sm">{waypoint.address}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveWaypoint(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Adicionar novo waypoint */}
          <div className="flex gap-2">
            <Input
              value={newWaypoint}
              onChange={(e) => setNewWaypoint(e.target.value)}
              placeholder="Adicionar parada intermediária"
              className="flex-1"
            />
            <Button 
              onClick={handleAddWaypoint}
              disabled={isCalculating || !newWaypoint.trim()}
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Informações da Rota */}
        {routeInfo && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Informações da Rota</label>
            <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-sm font-medium">{routeInfo.formatted_distance}</div>
                  <div className="text-xs text-gray-600">Distância Total</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-sm font-medium">{routeInfo.formatted_duration}</div>
                  <div className="text-xs text-gray-600">Tempo Estimado</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Distância do Motorista */}
        {driverDistance && ride?.driver_id && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Motorista</label>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500">
                  <Navigation className="h-3 w-3 mr-1" />
                  {driverDistance.formatted_distance}
                </Badge>
                <span className="text-sm text-gray-600">
                  até o destino ({driverDistance.formatted_duration})
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Status de Carregamento */}
        {isCalculating && (
          <div className="flex items-center justify-center p-4">
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Calculando rota...</span>
            </div>
          </div>
        )}

        {/* Botão para recalcular */}
        <Button 
          onClick={calculateRoute}
          disabled={isCalculating || !ride}
          className="w-full"
          variant="outline"
        >
          <Route className="h-4 w-4 mr-2" />
          Recalcular Rota
        </Button>
      </CardContent>
    </Card>
  );
};

export default RouteManager;

