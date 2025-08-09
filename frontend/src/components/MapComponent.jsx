
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { MapPin, Navigation, Car, User, RefreshCw } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './MapStyles.css';
import L from 'leaflet';

// Fix para ícones do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Ícones personalizados
const createCustomIcon = (color, icon) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 14px;
      ">
        ${icon}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const passengerIcon = createCustomIcon('#3B82F6', '👤');
const driverIcon = createCustomIcon('#10B981', '🚗');
const originIcon = createCustomIcon('#F59E0B', '🏁');
const destinationIcon = createCustomIcon('#EF4444', '🎯');

// Componente para centralizar o mapa
const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 15);
    }
  }, [center, zoom, map]);
  
  return null;
};

const MapComponent = ({ 
  currentUser, 
  ride = null, 
  showCurrentLocation = true,
  height = "400px",
  onLocationUpdate = null,
  routeData = null // Nova prop para dados da rota
}) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [mapCenter, setMapCenter] = useState([-23.5505, -46.6333]); // São Paulo como padrão
  const watchIdRef = useRef(null);

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
    if (showCurrentLocation) {
      startLocationTracking();
    }
    
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [showCurrentLocation]);

  useEffect(() => {
    // Buscar localização do motorista se for uma corrida ativa
    if (ride && ride.driver_id && currentUser.user_type === 'passenger') {
      const interval = setInterval(fetchDriverLocation, 5000); // Atualizar a cada 5 segundos
      fetchDriverLocation(); // Buscar imediatamente
      return () => clearInterval(interval);
    }
  }, [ride]);

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocalização não é suportada pelo navegador');
      return;
    }

    setIsTracking(true);
    setLocationError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };

    // Obter localização inicial
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        };
        
        setCurrentLocation(location);
        setMapCenter([location.lat, location.lng]);
        
        // Enviar para callback se fornecido
        if (onLocationUpdate) {
          onLocationUpdate(location);
        }
        
        // Salvar no backend se for motorista
        if (currentUser.user_type === 'driver') {
          updateLocationOnServer(location);
        }
      },
      (error) => {
        setLocationError(`Erro ao obter localização: ${error.message}`);
        setIsTracking(false);
      },
      options
    );

    // Iniciar rastreamento contínuo
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        };
        
        setCurrentLocation(location);
        
        if (onLocationUpdate) {
          onLocationUpdate(location);
        }
        
        if (currentUser.user_type === 'driver') {
          updateLocationOnServer(location);
        }
      },
      (error) => {
        console.error('Erro no rastreamento:', error);
        setLocationError(`Erro no rastreamento: ${error.message}`);
      },
      options
    );
  };

  const stopLocationTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  };

  const updateLocationOnServer = async (location) => {
    if (!currentUser || !ride) return;
    
    try {
      await fetch(`${API_BASE}/users/${currentUser.id}/location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: location.lat,
          longitude: location.lng,
          ride_id: ride.id
        }),
      });
    } catch (error) {
      console.error('Erro ao atualizar localização no servidor:', error);
    }
  };

  const fetchDriverLocation = async () => {
    if (!ride || !ride.driver_id) return;
    
    try {
      const response = await fetch(`${API_BASE}/users/${ride.driver_id}/location`);
      if (response.ok) {
        const location = await response.json();
        setDriverLocation(location);
      }
    } catch (error) {
      console.error('Erro ao buscar localização do motorista:', error);
    }
  };

  const centerOnCurrentLocation = () => {
    if (currentLocation) {
      setMapCenter([currentLocation.lat, currentLocation.lng]);
    }
  };

  // Geocodificação simples para origem e destino (simulada)
  const getCoordinatesFromAddress = (address) => {
    // Em uma implementação real, você usaria uma API de geocodificação
    // Por agora, vamos simular coordenadas próximas ao centro de São Paulo
    const baseLatitude = -23.5505;
    const baseLongitude = -46.6333;
    
    // Gerar coordenadas aleatórias próximas
    const randomOffset = () => (Math.random() - 0.5) * 0.01;
    
    return {
      lat: baseLatitude + randomOffset(),
      lng: baseLongitude + randomOffset()
    };
  };

  const originCoords = ride ? getCoordinatesFromAddress(ride.origin) : null;
  const destinationCoords = ride ? getCoordinatesFromAddress(ride.destination) : null;

  // Converter geometria GeoJSON para coordenadas do Polyline
  const getRouteCoordinates = () => {
    if (!routeData || !routeData.route || !routeData.route.geometry) {
      return [];
    }

    const geometry = routeData.route.geometry;
    if (geometry.type === 'LineString') {
      // Converter de [lng, lat] para [lat, lng] para o Leaflet
      return geometry.coordinates.map(coord => [coord[1], coord[0]]);
    }
    return [];
  };

  const routeCoordinates = getRouteCoordinates();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mapa GPS - Localização em Tempo Real
          </span>
          <div className="flex items-center gap-2">
            {isTracking && (
              <Badge className="bg-green-500">
                <Navigation className="h-3 w-3 mr-1" />
                Rastreando
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={centerOnCurrentLocation}
              disabled={!currentLocation}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {locationError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{locationError}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={startLocationTracking}
              className="mt-2"
            >
              Tentar Novamente
            </Button>
          </div>
        )}

        <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden border">
          <MapContainer
            center={mapCenter}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapController center={mapCenter} zoom={15} />

            {/* Localização atual do usuário */}
            {currentLocation && (
              <Marker
                position={[currentLocation.lat, currentLocation.lng]}
                icon={currentUser.user_type === 'driver' ? driverIcon : passengerIcon}
              >
                <Popup>
                  <div className="text-center">
                    <h3 className="font-semibold">
                      {currentUser.user_type === 'driver' ? 'Sua Localização (Motorista)' : 'Sua Localização (Passageiro)'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Precisão: ±{Math.round(currentLocation.accuracy)}m
                    </p>
                    <p className="text-xs text-gray-500">
                      Atualizado: {new Date(currentLocation.timestamp).toLocaleTimeString('pt-BR')}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Localização do motorista (para passageiros) */}
            {driverLocation && currentUser.user_type === 'passenger' && (
              <Marker
                position={[driverLocation.latitude, driverLocation.longitude]}
                icon={driverIcon}
              >
                <Popup>
                  <div className="text-center">
                    <h3 className="font-semibold">Motorista</h3>
                    <p className="text-sm text-gray-600">
                      {ride.driver.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      Atualizado: {new Date(driverLocation.updated_at).toLocaleTimeString('pt-BR')}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Rota calculada */}
            {routeCoordinates.length > 0 && (
              <Polyline
                positions={routeCoordinates}
                color="#3B82F6"
                weight={4}
                opacity={0.7}
              />
            )}

            {/* Waypoints da rota */}
            {ride && ride.waypoints && ride.waypoints.map((waypoint, index) => (
              <Marker
                key={`waypoint-${index}`}
                position={[waypoint.lat, waypoint.lng]}
                icon={createCustomIcon('#F59E0B', `${index + 1}`)}
              >
                <Popup>
                  <div className="text-center">
                    <h3 className="font-semibold">Parada {index + 1}</h3>
                    <p className="text-sm text-gray-600">{waypoint.address}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Origem da corrida */}
            {originCoords && (
              <Marker position={[originCoords.lat, originCoords.lng]} icon={originIcon}>
                <Popup>
                  <div className="text-center">
                    <h3 className="font-semibold">Origem</h3>
                    <p className="text-sm text-gray-600">{ride.origin}</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Destino da corrida */}
            {destinationCoords && (
              <Marker position={[destinationCoords.lat, destinationCoords.lng]} icon={destinationIcon}>
                <Popup>
                  <div className="text-center">
                    <h3 className="font-semibold">Destino</h3>
                    <p className="text-sm text-gray-600">{ride.destination}</p>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        {/* Informações de localização */}
        {currentLocation && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Latitude:</span>
                <br />
                {currentLocation.lat.toFixed(6)}
              </div>
              <div>
                <span className="font-medium">Longitude:</span>
                <br />
                {currentLocation.lng.toFixed(6)}
              </div>
            </div>
          </div>
        )}

        {/* Controles de rastreamento */}
        <div className="mt-4 flex gap-2">
          {!isTracking ? (
            <Button onClick={startLocationTracking} className="flex-1">
              <Navigation className="h-4 w-4 mr-2" />
              Iniciar Rastreamento
            </Button>
          ) : (
            <Button onClick={stopLocationTracking} variant="destructive" className="flex-1">
              Parar Rastreamento
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MapComponent;

