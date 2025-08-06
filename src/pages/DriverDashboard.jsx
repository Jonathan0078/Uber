import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { LogOut, Car, MapPin, Clock, Star, DollarSign } from 'lucide-react'

export default function DriverDashboard({ driver, onLogout }) {
  const [isAvailable, setIsAvailable] = useState(driver.available || false)
  const [rideRequests, setRideRequests] = useState([])
  const [currentRide, setCurrentRide] = useState(null)
  const [earnings, setEarnings] = useState(0)

  useEffect(() => {
    // Atualizar disponibilidade no localStorage
    const drivers = JSON.parse(localStorage.getItem('drivers') || '[]')
    const updatedDrivers = drivers.map(d => 
      d.id === driver.id ? { ...d, available: isAvailable } : d
    )
    localStorage.setItem('drivers', JSON.stringify(updatedDrivers))

    // Simular recebimento de solicitações de corrida
    if (isAvailable) {
      const interval = setInterval(() => {
        const rides = JSON.parse(localStorage.getItem('rides') || '[]')
        const pendingRides = rides.filter(r => 
          r.status === 'inProgress' && 
          r.driverId === driver.id && 
          !rideRequests.find(req => req.id === r.id) &&
          r.id !== currentRide?.id
        )
        
        if (pendingRides.length > 0) {
          setRideRequests(prev => [...prev, ...pendingRides])
        }
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [isAvailable, driver.id, rideRequests, currentRide])

  const acceptRide = (ride) => {
    setCurrentRide(ride)
    setRideRequests(rideRequests.filter(r => r.id !== ride.id))
    
    // Atualizar status da corrida
    const rides = JSON.parse(localStorage.getItem('rides') || '[]')
    const updatedRides = rides.map(r => 
      r.id === ride.id ? { ...r, status: 'accepted' } : r
    )
    localStorage.setItem('rides', JSON.stringify(updatedRides))
  }

  const completeRide = () => {
    if (currentRide) {
      // Simular ganho da corrida
      const rideEarning = Math.floor(Math.random() * 20) + 10 // R$ 10-30
      setEarnings(prev => prev + rideEarning)
      
      // Atualizar estatísticas do motorista
      const drivers = JSON.parse(localStorage.getItem('drivers') || '[]')
      const updatedDrivers = drivers.map(d => 
        d.id === driver.id ? { ...d, trips: d.trips + 1 } : d
      )
      localStorage.setItem('drivers', JSON.stringify(updatedDrivers))
      
      setCurrentRide(null)
      alert(`Corrida concluída! Você ganhou R$ ${rideEarning},00`)
    }
  }

  const rejectRide = (rideId) => {
    setRideRequests(rideRequests.filter(r => r.id !== rideId))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Car className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">Olá, {driver.name}</h1>
              <p className="text-sm text-gray-500">{driver.vehicle} - {driver.plate}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Status de Disponibilidade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Status</span>
              <Badge variant={isAvailable ? "default" : "secondary"}>
                {isAvailable ? 'Disponível' : 'Indisponível'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <Switch
                checked={isAvailable}
                onCheckedChange={setIsAvailable}
              />
              <span className="text-sm">
                {isAvailable ? 'Você está online e pode receber corridas' : 'Você está offline'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{driver.rating}</p>
                  <p className="text-xs text-gray-500">Avaliação</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Car className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{driver.trips}</p>
                  <p className="text-xs text-gray-500">Corridas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ganhos do Dia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Ganhos de hoje</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">R$ {earnings},00</p>
          </CardContent>
        </Card>

        {/* Corrida Atual */}
        {currentRide && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Corrida em andamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium text-blue-900">Destino</p>
                  <p className="text-sm text-blue-700">{currentRide.destination}</p>
                </div>
              </div>
              <Button 
                onClick={completeRide}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Finalizar corrida
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Solicitações de Corrida */}
        {isAvailable && rideRequests.length > 0 && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-900">Nova solicitação de corrida!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {rideRequests.map((ride) => {
                // Buscar informações do usuário
                const users = JSON.parse(localStorage.getItem('users') || '[]')
                const user = users.find(u => u.id === ride.userId) || { name: 'Usuário', phone: 'N/A' }
                
                return (
                  <div key={ride.id} className="space-y-3 p-3 bg-white rounded-lg border">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-green-600 mt-1" />
                      <div className="flex-1">
                        <p className="font-medium text-green-900">Passageiro: {user.name}</p>
                        <p className="text-sm text-green-700">Telefone: {user.phone}</p>
                        <p className="text-sm text-green-700">Destino: {ride.destination}</p>
                        <p className="text-sm text-green-600">
                          Pagamento: {ride.paymentMethod === 'pix' ? `PIX - ${ride.pixKey}` : 'Dinheiro'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-green-600" />
                      <p className="text-sm text-green-700">
                        Solicitado há {Math.floor((Date.now() - new Date(ride.createdAt).getTime()) / 60000)} min
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => acceptRide(ride)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        Aceitar
                      </Button>
                      <Button 
                        onClick={() => rejectRide(ride.id)}
                        variant="outline"
                        className="flex-1"
                      >
                        Recusar
                      </Button>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {/* Estado quando não há corridas */}
        {isAvailable && rideRequests.length === 0 && !currentRide && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">
                <Car className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">Aguardando solicitações de corrida...</p>
                <p className="text-xs mt-1">Mantenha-se próximo ao centro da cidade</p>
              </div>
            </CardContent>
          </Card>
        )}

        {!isAvailable && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">
                <Car className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">Você está offline</p>
                <p className="text-xs mt-1">Ative seu status para receber corridas</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

