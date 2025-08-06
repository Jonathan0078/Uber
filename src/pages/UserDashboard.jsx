import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogOut, MapPin, Navigation, Clock, User } from 'lucide-react'

export default function UserDashboard({ user, onLogout }) {
  const [currentLocation, setCurrentLocation] = useState(null)
  const [destination, setDestination] = useState('')
  const [rideStatus, setRideStatus] = useState('idle') // idle, requesting, matched, inProgress
  const [driver, setDriver] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Solicitar localização atual
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Erro ao obter localização:', error)
          // Usar localização padrão de Rio Pardo-RS
          setCurrentLocation({
            lat: -29.9897,
            lng: -52.3789
          })
        }
      )
    } else {
      // Usar localização padrão de Rio Pardo-RS
      setCurrentLocation({
        lat: -29.9897,
        lng: -52.3789
      })
    }
  }, [])

  const requestRide = async () => {
    if (!destination.trim()) {
      alert('Por favor, informe o destino!')
      return
    }

    setLoading(true)
    setRideStatus('requesting')

    // Simular busca por motorista
    setTimeout(() => {
      // Verificar se há motoristas disponíveis
      const drivers = JSON.parse(localStorage.getItem('drivers') || '[]')
      const availableDrivers = drivers.filter(d => d.available)

      if (availableDrivers.length > 0) {
        const selectedDriver = availableDrivers[0]
        setDriver(selectedDriver)
        setRideStatus('matched')
        
        // Criar registro da corrida
        const ride = {
          id: Date.now(),
          userId: user.id,
          driverId: selectedDriver.id,
          origin: currentLocation,
          destination: destination,
          status: 'matched',
          createdAt: new Date().toISOString()
        }
        
        const rides = JSON.parse(localStorage.getItem('rides') || '[]')
        rides.push(ride)
        localStorage.setItem('rides', JSON.stringify(rides))
        
        // Simular chegada do motorista
        setTimeout(() => {
          setRideStatus('inProgress')
        }, 5000)
      } else {
        alert('Nenhum motorista disponível no momento. Tente novamente em alguns minutos.')
        setRideStatus('idle')
      }
      setLoading(false)
    }, 3000)
  }

  const cancelRide = () => {
    setRideStatus('idle')
    setDriver(null)
    setDestination('')
  }

  const getRideStatusText = () => {
    switch (rideStatus) {
      case 'requesting':
        return 'Procurando motorista...'
      case 'matched':
        return `Motorista encontrado! ${driver?.name} está a caminho.`
      case 'inProgress':
        return 'Corrida em andamento'
      default:
        return 'Solicitar corrida'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">Olá, {user.name}</h1>
              <p className="text-sm text-gray-500">Rio Pardo-RS</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Mapa Simulado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Sua localização</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {currentLocation 
                    ? `Lat: ${currentLocation.lat.toFixed(4)}, Lng: ${currentLocation.lng.toFixed(4)}`
                    : 'Obtendo localização...'
                  }
                </p>
                <p className="text-xs text-gray-500 mt-1">Rio Pardo-RS</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Solicitação de Corrida */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Navigation className="w-5 h-5" />
              <span>Solicitar corrida</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="destination">Para onde você quer ir?</Label>
              <Input
                id="destination"
                placeholder="Digite o endereço de destino"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                disabled={rideStatus !== 'idle'}
              />
            </div>

            {rideStatus === 'idle' && (
              <Button 
                onClick={requestRide}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading || !destination.trim()}
              >
                {loading ? 'Procurando...' : 'Solicitar corrida'}
              </Button>
            )}

            {rideStatus !== 'idle' && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>{getRideStatusText()}</span>
                </div>
                
                {driver && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-medium text-blue-900">Seu motorista</h4>
                    <p className="text-sm text-blue-700">{driver.name}</p>
                    <p className="text-sm text-blue-600">{driver.vehicle}</p>
                    <p className="text-sm text-blue-600">Placa: {driver.plate}</p>
                  </div>
                )}

                <Button 
                  onClick={cancelRide}
                  variant="outline"
                  className="w-full"
                >
                  Cancelar corrida
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Histórico de Corridas */}
        <Card>
          <CardHeader>
            <CardTitle>Suas corridas</CardTitle>
            <CardDescription>Histórico das suas últimas corridas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-500 py-4">
              <p className="text-sm">Nenhuma corrida realizada ainda</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

