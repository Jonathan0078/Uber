import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogOut, Car, MapPin, Clock, Star, DollarSign, Send, CheckCircle } from 'lucide-react'

export default function DriverDashboard({ driver, onLogout }) {
  const [isAvailable, setIsAvailable] = useState(driver.available || false)
  const [rideRequests, setRideRequests] = useState([])
  const [currentRide, setCurrentRide] = useState(null)
  const [earnings, setEarnings] = useState(0)
  const [proposedPrices, setProposedPrices] = useState({})

  useEffect(() => {
    // Atualizar disponibilidade no localStorage
    const drivers = JSON.parse(localStorage.getItem('drivers') || '[]')
    const updatedDrivers = drivers.map(d => 
      d.id === driver.id ? { ...d, available: isAvailable } : d
    )
    localStorage.setItem('drivers', JSON.stringify(updatedDrivers))

    // Verificar solicitações de corrida
    if (isAvailable) {
      const interval = setInterval(() => {
        const requests = JSON.parse(localStorage.getItem('rideRequests') || '[]')
        const driverRequests = requests.filter(r => 
          r.driverId === driver.id && 
          (r.status === 'waitingPrice' || r.status === 'accepted')
        )
        
        // Atualizar solicitações pendentes
        const waitingRequests = driverRequests.filter(r => r.status === 'waitingPrice')
        setRideRequests(waitingRequests)
        
        // Verificar corridas aceitas
        const acceptedRides = driverRequests.filter(r => r.status === 'accepted')
        if (acceptedRides.length > 0 && !currentRide) {
          setCurrentRide(acceptedRides[0])
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isAvailable, driver.id, currentRide])

  const handlePriceChange = (requestId, price) => {
    setProposedPrices(prev => ({
      ...prev,
      [requestId]: price
    }))
  }

  const sendPriceProposal = (request) => {
    const price = proposedPrices[request.id]
    
    if (!price || price <= 0) {
      alert('Por favor, insira um preço válido!')
      return
    }

    // Atualizar a solicitação com a proposta de preço
    const requests = JSON.parse(localStorage.getItem('rideRequests') || '[]')
    const updatedRequests = requests.map(r => 
      r.id === request.id 
        ? { ...r, status: 'priceProposed', proposedPrice: parseFloat(price) }
        : r
    )
    localStorage.setItem('rideRequests', JSON.stringify(updatedRequests))
    
    // Remover da lista local
    setRideRequests(prev => prev.filter(r => r.id !== request.id))
    
    // Limpar o preço proposto
    setProposedPrices(prev => {
      const newPrices = { ...prev }
      delete newPrices[request.id]
      return newPrices
    })
    
    alert(`Proposta de R$ ${price} enviada para ${request.userName}!`)
  }

  const rejectRide = (requestId) => {
    // Atualizar status da solicitação
    const requests = JSON.parse(localStorage.getItem('rideRequests') || '[]')
    const updatedRequests = requests.map(r => 
      r.id === requestId ? { ...r, status: 'rejected' } : r
    )
    localStorage.setItem('rideRequests', JSON.stringify(updatedRequests))
    
    // Remover da lista local
    setRideRequests(prev => prev.filter(r => r.id !== requestId))
  }

  const startRide = () => {
    if (currentRide) {
      // Atualizar status da corrida
      const requests = JSON.parse(localStorage.getItem('rideRequests') || '[]')
      const updatedRequests = requests.map(r => 
        r.id === currentRide.id ? { ...r, status: 'inProgress' } : r
      )
      localStorage.setItem('rideRequests', JSON.stringify(updatedRequests))
      
      setCurrentRide(prev => ({ ...prev, status: 'inProgress' }))
    }
  }

  const completeRide = () => {
    if (currentRide) {
      // Adicionar ganho da corrida
      const rideEarning = currentRide.acceptedPrice || currentRide.proposedPrice || 0
      setEarnings(prev => prev + rideEarning)
      
      // Atualizar estatísticas do motorista
      const drivers = JSON.parse(localStorage.getItem('drivers') || '[]')
      const updatedDrivers = drivers.map(d => 
        d.id === driver.id ? { ...d, trips: (d.trips || 0) + 1 } : d
      )
      localStorage.setItem('drivers', JSON.stringify(updatedDrivers))
      
      // Marcar corrida como concluída
      const requests = JSON.parse(localStorage.getItem('rideRequests') || '[]')
      const updatedRequests = requests.map(r => 
        r.id === currentRide.id ? { ...r, status: 'completed' } : r
      )
      localStorage.setItem('rideRequests', JSON.stringify(updatedRequests))
      
      setCurrentRide(null)
      alert(`Corrida concluída! Você ganhou R$ ${rideEarning.toFixed(2)}`)
    }
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
                  <p className="text-2xl font-bold">{driver.rating || '4.8'}</p>
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
                  <p className="text-2xl font-bold">{driver.trips || 0}</p>
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
            <p className="text-3xl font-bold text-green-600">R$ {earnings.toFixed(2)}</p>
          </CardContent>
        </Card>

        {/* Corrida Atual */}
        {currentRide && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">
                {currentRide.status === 'inProgress' ? 'Corrida em andamento' : 'Corrida aceita'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-white border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium text-blue-900">Passageiro: {currentRide.userName}</p>
                    <p className="text-sm text-blue-700">Telefone: {currentRide.userPhone}</p>
                    <p className="text-sm text-blue-700">De: {currentRide.origin}</p>
                    <p className="text-sm text-blue-700">Para: {currentRide.destination}</p>
                    <p className="text-sm font-semibold text-green-700">
                      Preço: R$ {(currentRide.acceptedPrice || currentRide.proposedPrice || 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-blue-600">
                      Pagamento: {currentRide.paymentMethod === 'pix' ? 'PIX' : 'Dinheiro'}
                    </p>
                  </div>
                </div>
              </div>
              
              {currentRide.status === 'accepted' && (
                <Button 
                  onClick={startRide}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Iniciar corrida
                </Button>
              )}
              
              {currentRide.status === 'inProgress' && (
                <Button 
                  onClick={completeRide}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Finalizar corrida
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Solicitações de Corrida com Proposta de Preço */}
        {isAvailable && rideRequests.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-900">Solicitações de Corrida</CardTitle>
              <CardDescription className="text-orange-700">
                Analise as solicitações e envie sua proposta de preço
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {rideRequests.map((request) => (
                <div key={request.id} className="space-y-3 p-4 bg-white rounded-lg border border-orange-200">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-orange-600 mt-1" />
                    <div className="flex-1">
                      <p className="font-medium text-orange-900">Passageiro: {request.userName}</p>
                      <p className="text-sm text-orange-700">Telefone: {request.userPhone}</p>
                      <p className="text-sm text-orange-700">
                        <strong>De:</strong> {request.origin}
                      </p>
                      <p className="text-sm text-orange-700">
                        <strong>Para:</strong> {request.destination}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <p className="text-sm text-orange-700">
                      Solicitado há {Math.floor((Date.now() - new Date(request.createdAt).getTime()) / 60000)} min
                    </p>
                  </div>

                  {/* Campo para inserir preço */}
                  <div className="space-y-2">
                    <Label htmlFor={`price-${request.id}`} className="text-orange-900">
                      Qual o preço da corrida?
                    </Label>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-orange-900">R$</span>
                      <Input
                        id={`price-${request.id}`}
                        type="number"
                        step="0.01"
                        min="1"
                        placeholder="0,00"
                        value={proposedPrices[request.id] || ''}
                        onChange={(e) => handlePriceChange(request.id, e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {/* Botões de ação */}
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => sendPriceProposal(request)}
                      disabled={!proposedPrices[request.id] || proposedPrices[request.id] <= 0}
                      className="flex-1 bg-orange-600 hover:bg-orange-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Proposta
                    </Button>
                    <Button 
                      onClick={() => rejectRide(request.id)}
                      variant="outline"
                      className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                    >
                      Recusar
                    </Button>
                  </div>
                </div>
              ))}
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

