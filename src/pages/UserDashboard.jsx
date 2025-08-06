import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { LogOut, MapPin, Navigation, Clock, User, Star, Car, DollarSign, CheckCircle, XCircle } from 'lucide-react'

export default function UserDashboard({ user, onLogout }) {
  const [currentLocation, setCurrentLocation] = useState(null)
  const [originStreet, setOriginStreet] = useState('')
  const [destination, setDestination] = useState('')
  const [rideStatus, setRideStatus] = useState('idle') // idle, requesting, waitingPrice, priceReceived, matched, inProgress
  const [availableDrivers, setAvailableDrivers] = useState([])
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [driverPrice, setDriverPrice] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [loading, setLoading] = useState(false)
  const [rideRequests, setRideRequests] = useState([])

  // Ruas de Rio Pardo para seleção
  const rioPardoStreets = [
    'Rua Júlio de Castilhos (Rua da Ladeira)',
    'Rua Andrade Neves',
    'Rua General Osório',
    'Rua Barão do Rio Branco',
    'Rua Marechal Deodoro',
    'Rua Coronel Vicente',
    'Rua Voluntários da Pátria',
    'Rua Tiradentes',
    'Rua Benjamin Constant',
    'Avenida Independência'
  ]

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

    // Verificar se há propostas de preço dos motoristas
    const interval = setInterval(() => {
      const requests = JSON.parse(localStorage.getItem('rideRequests') || '[]')
      const userRequests = requests.filter(r => r.userId === user.id && r.status === 'priceProposed')
      
      if (userRequests.length > 0 && rideStatus === 'waitingPrice') {
        const request = userRequests[0]
        setDriverPrice(request.proposedPrice)
        setSelectedDriver(request.driver)
        setRideStatus('priceReceived')
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [user.id, rideStatus])

  const requestRide = async () => {
    if (!originStreet.trim() || !destination.trim()) {
      alert('Por favor, selecione a rua de origem e destino!')
      return
    }

    if (originStreet === destination) {
      alert('A rua de origem e destino não podem ser iguais!')
      return
    }

    setLoading(true)
    setRideStatus('requesting')

    // Simular busca por motoristas
    setTimeout(() => {
      // Buscar motoristas cadastrados
      const drivers = JSON.parse(localStorage.getItem('drivers') || '[]')
      const availableDriversList = drivers.filter(d => d.available !== false).map(driver => ({
        ...driver,
        distance: `${(Math.random() * 5 + 0.5).toFixed(1)} km`,
        eta: `${Math.floor(Math.random() * 10 + 2)} min`,
        rating: (Math.random() * 1 + 4).toFixed(1)
      }))

      if (availableDriversList.length > 0) {
        setAvailableDrivers(availableDriversList)
      } else {
        // Motoristas simulados caso não haja cadastrados
        const mockDrivers = [
          {
            id: 1,
            name: 'Carlos Silva',
            vehicle: 'Honda Civic Branco',
            plate: 'ABC-1234',
            pixKey: 'carlos.silva@email.com',
            distance: '2.1 km',
            eta: '5 min',
            rating: '4.8'
          },
          {
            id: 2,
            name: 'Maria Santos',
            vehicle: 'Toyota Corolla Prata',
            plate: 'DEF-5678',
            pixKey: '(51) 99999-9999',
            distance: '1.5 km',
            eta: '3 min',
            rating: '4.9'
          },
          {
            id: 3,
            name: 'João Oliveira',
            vehicle: 'Chevrolet Onix Azul',
            plate: 'GHI-9012',
            pixKey: 'joao.oliveira@pix.com',
            distance: '3.2 km',
            eta: '7 min',
            rating: '4.7'
          }
        ]
        setAvailableDrivers(mockDrivers)
      }
      setLoading(false)
    }, 2000)
  }

  const selectDriver = (driver) => {
    setSelectedDriver(driver)
    setRideStatus('waitingPrice')
    
    // Criar solicitação de corrida para o motorista
    const rideRequest = {
      id: Date.now(),
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      driverId: driver.id,
      driver: driver,
      origin: originStreet,
      destination: destination,
      status: 'waitingPrice',
      createdAt: new Date().toISOString()
    }
    
    const requests = JSON.parse(localStorage.getItem('rideRequests') || '[]')
    requests.push(rideRequest)
    localStorage.setItem('rideRequests', JSON.stringify(requests))
  }

  const acceptPrice = () => {
    if (!paymentMethod) {
      alert('Por favor, selecione uma forma de pagamento!')
      return
    }

    setRideStatus('matched')
    
    // Atualizar status da solicitação
    const requests = JSON.parse(localStorage.getItem('rideRequests') || '[]')
    const updatedRequests = requests.map(r => 
      r.userId === user.id && r.status === 'priceProposed' 
        ? { ...r, status: 'accepted', paymentMethod: paymentMethod, acceptedPrice: driverPrice }
        : r
    )
    localStorage.setItem('rideRequests', JSON.stringify(updatedRequests))
    
    // Criar registro da corrida
    const ride = {
      id: Date.now(),
      userId: user.id,
      driverId: selectedDriver.id,
      origin: originStreet,
      destination: destination,
      price: driverPrice,
      paymentMethod: paymentMethod,
      pixKey: paymentMethod === 'pix' ? selectedDriver.pixKey : null,
      status: 'accepted',
      createdAt: new Date().toISOString()
    }
    
    const rides = JSON.parse(localStorage.getItem('rides') || '[]')
    rides.push(ride)
    localStorage.setItem('rides', JSON.stringify(rides))
  }

  const rejectPrice = () => {
    // Atualizar status da solicitação
    const requests = JSON.parse(localStorage.getItem('rideRequests') || '[]')
    const updatedRequests = requests.map(r => 
      r.userId === user.id && r.status === 'priceProposed' 
        ? { ...r, status: 'rejected' }
        : r
    )
    localStorage.setItem('rideRequests', JSON.stringify(updatedRequests))
    
    // Voltar para seleção de motoristas
    setRideStatus('requesting')
    setSelectedDriver(null)
    setDriverPrice(null)
    setPaymentMethod('')
  }

  const startRide = () => {
    setRideStatus('inProgress')
    
    // Atualizar status da corrida
    const rides = JSON.parse(localStorage.getItem('rides') || '[]')
    const updatedRides = rides.map(r => 
      r.userId === user.id && r.status === 'accepted' 
        ? { ...r, status: 'inProgress' }
        : r
    )
    localStorage.setItem('rides', JSON.stringify(updatedRides))
  }

  const cancelRide = () => {
    // Cancelar solicitações pendentes
    const requests = JSON.parse(localStorage.getItem('rideRequests') || '[]')
    const updatedRequests = requests.map(r => 
      r.userId === user.id && (r.status === 'waitingPrice' || r.status === 'priceProposed')
        ? { ...r, status: 'cancelled' }
        : r
    )
    localStorage.setItem('rideRequests', JSON.stringify(updatedRequests))
    
    setRideStatus('idle')
    setSelectedDriver(null)
    setAvailableDrivers([])
    setDriverPrice(null)
    setPaymentMethod('')
    setOriginStreet('')
    setDestination('')
  }

  const getRideStatusText = () => {
    switch (rideStatus) {
      case 'requesting':
        return 'Procurando motoristas...'
      case 'waitingPrice':
        return `Aguardando proposta de preço de ${selectedDriver?.name}...`
      case 'priceReceived':
        return `${selectedDriver?.name} enviou uma proposta de preço`
      case 'matched':
        return `Corrida confirmada com ${selectedDriver?.name}`
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
        {/* Mapa com GPS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Sua localização</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-lg h-48 flex items-center justify-center relative">
              <div className="text-center">
                <div className="text-4xl mb-2">🗺️</div>
                <p className="text-sm font-medium text-gray-700">Rio Pardo - RS</p>
                {currentLocation && (
                  <div className="mt-2">
                    <p className="text-xs text-green-600">📍 GPS Ativo</p>
                    <p className="text-xs text-gray-500">
                      {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                    </p>
                  </div>
                )}
              </div>
              {currentLocation && (
                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs shadow">
                  GPS ON
                </div>
              )}
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
              <Label htmlFor="origin">De onde você está?</Label>
              <Select value={originStreet} onValueChange={setOriginStreet} disabled={rideStatus !== 'idle'}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione sua rua atual" />
                </SelectTrigger>
                <SelectContent>
                  {rioPardoStreets.map((street, index) => (
                    <SelectItem key={index} value={street}>{street}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Para onde você quer ir?</Label>
              <Select value={destination} onValueChange={setDestination} disabled={rideStatus !== 'idle'}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o destino" />
                </SelectTrigger>
                <SelectContent>
                  {rioPardoStreets.filter(street => street !== originStreet).map((street, index) => (
                    <SelectItem key={index} value={street}>{street}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {rideStatus === 'idle' && (
              <Button 
                onClick={requestRide}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading || !originStreet.trim() || !destination.trim()}
              >
                {loading ? 'Procurando...' : 'Buscar Motoristas'}
              </Button>
            )}

            {rideStatus !== 'idle' && rideStatus !== 'inProgress' && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>{getRideStatusText()}</span>
                </div>

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

        {/* Lista de Motoristas Disponíveis */}
        {rideStatus === 'requesting' && availableDrivers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Motoristas Disponíveis</CardTitle>
              <CardDescription>Selecione um motorista para solicitar o preço da corrida</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {availableDrivers.map((driver) => (
                <div
                  key={driver.id}
                  onClick={() => selectDriver(driver)}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Car className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{driver.name}</p>
                        <p className="text-sm text-gray-600">{driver.vehicle}</p>
                        <p className="text-sm text-gray-500">Placa: {driver.plate}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-gray-600">{driver.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-blue-600">{driver.distance}</p>
                      <p className="text-xs text-gray-500">{driver.eta}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Aguardando Proposta de Preço */}
        {rideStatus === 'waitingPrice' && selectedDriver && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-900">Aguardando Proposta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-white border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Car className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-yellow-900">{selectedDriver.name}</p>
                    <p className="text-sm text-yellow-700">{selectedDriver.vehicle}</p>
                    <p className="text-sm text-yellow-600">Placa: {selectedDriver.plate}</p>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">⏳</div>
                <p className="text-sm text-yellow-700">O motorista está analisando sua solicitação e enviará o preço em breve</p>
                <p className="text-xs text-yellow-600 mt-1">De: {originStreet}</p>
                <p className="text-xs text-yellow-600">Para: {destination}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Proposta de Preço Recebida */}
        {rideStatus === 'priceReceived' && selectedDriver && driverPrice && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-900">Proposta de Preço Recebida</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-white border border-green-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Car className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-green-900">{selectedDriver.name}</p>
                    <p className="text-sm text-green-700">{selectedDriver.vehicle}</p>
                    <p className="text-sm text-green-600">Placa: {selectedDriver.plate}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-green-600">{selectedDriver.rating}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preço Proposto */}
              <div className="p-4 bg-white border-2 border-green-300 rounded-lg text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  <span className="text-3xl font-bold text-green-900">R$ {driverPrice}</span>
                </div>
                <p className="text-sm text-green-700">Preço proposto para a corrida</p>
                <p className="text-xs text-green-600 mt-1">De: {originStreet}</p>
                <p className="text-xs text-green-600">Para: {destination}</p>
              </div>

              {/* Opções de Pagamento */}
              <div className="space-y-3">
                <Label>Forma de Pagamento:</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pix" id="pix" />
                    <Label htmlFor="pix" className="flex-1">
                      <div>
                        <p className="font-medium">PIX</p>
                        <p className="text-sm text-gray-600">{selectedDriver.pixKey}</p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dinheiro" id="dinheiro" />
                    <Label htmlFor="dinheiro">Dinheiro</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Botões de Ação */}
              <div className="flex space-x-2">
                <Button
                  onClick={acceptPrice}
                  disabled={!paymentMethod}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aceitar R$ {driverPrice}
                </Button>
                <Button
                  onClick={rejectPrice}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Recusar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Corrida Confirmada */}
        {rideStatus === 'matched' && selectedDriver && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Corrida Confirmada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-white border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Car className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">{selectedDriver.name}</p>
                    <p className="text-sm text-blue-700">{selectedDriver.vehicle}</p>
                    <p className="text-sm text-blue-600">Placa: {selectedDriver.plate}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-blue-600">{selectedDriver.rating}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Preço acordado:</strong> R$ {driverPrice}
                </p>
                <p className="text-sm text-blue-700">
                  <strong>Pagamento:</strong> {paymentMethod === 'pix' ? `PIX - ${selectedDriver.pixKey}` : 'Dinheiro'}
                </p>
                <p className="text-sm text-blue-700">
                  <strong>De:</strong> {originStreet}
                </p>
                <p className="text-sm text-blue-700">
                  <strong>Para:</strong> {destination}
                </p>
              </div>

              <Button
                onClick={startRide}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Iniciar Corrida
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Status da Corrida em Andamento */}
        {rideStatus === 'inProgress' && selectedDriver && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700">Corrida em Andamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  <strong>Preço:</strong> R$ {driverPrice}
                </p>
                <p className="text-sm text-green-700">
                  <strong>Destino:</strong> {destination}
                </p>
                <p className="text-sm text-green-700">
                  <strong>Motorista:</strong> {selectedDriver.name}
                </p>
                <p className="text-sm text-green-700">
                  <strong>Pagamento:</strong> {paymentMethod === 'pix' ? `PIX - ${selectedDriver.pixKey}` : 'Dinheiro'}
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🚗💨</div>
                <p className="text-sm text-gray-600">O motorista está a caminho do destino</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

