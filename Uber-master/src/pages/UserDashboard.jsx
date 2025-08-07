import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { LogOut, MapPin, Navigation, Clock, User, Star, Car, DollarSign, CheckCircle, XCircle } from 'lucide-react'
import { rideRequestService, driverService, chatService } from '../services/firestoreService'
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState("")
  // Carregar mensagens do chat quando corrida for matched ou inProgress
  useEffect(() => {
    let unsubscribe = null;
    if ((rideStatus === 'matched' || rideStatus === 'inProgress') && selectedDriver) {
      // O ID do chat pode ser userId + driverId (ou ID da corrida, se existir)
      const chatId = [user.id, selectedDriver.id].sort().join('_');
      unsubscribe = chatService.onMessages(chatId, (msgs) => setChatMessages(msgs));
    } else {
      setChatMessages([])
    }
    return () => { if (unsubscribe) unsubscribe(); };
  }, [rideStatus, selectedDriver, user.id]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !selectedDriver) return;
    const chatId = [user.id, selectedDriver.id].sort().join('_');
    await chatService.sendMessage(chatId, {
      senderId: user.id,
      senderName: user.name,
      text: chatInput,
      timestamp: new Date().toISOString(),
      type: 'user'
    });
    setChatInput("");
  }
import LiveMap from '../components/LiveMap'
import { getDistanceKm } from '../lib/utils'

export default function UserDashboard({ user, onLogout }) {
  const [currentLocation, setCurrentLocation] = useState(null)
  const [originStreet, setOriginStreet] = useState('')
  const [destination, setDestination] = useState('')
  const [rideStatus, setRideStatus] = useState('idle') // idle, requesting, waitingPrice, priceReceived, matched, inProgress
  const [availableDrivers, setAvailableDrivers] = useState([])
  const [allDrivers, setAllDrivers] = useState([])
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [driverPrice, setDriverPrice] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [loading, setLoading] = useState(false)
  const [rideRequests, setRideRequests] = useState([])



  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.id) {
        const userData = await userService.getById(user.id);
      }
    };
    fetchUserData();

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
          setCurrentLocation({ lat: -29.9897, lng: -52.3789 })
        }
      )
    } else {
      setCurrentLocation({ lat: -29.9897, lng: -52.3789 })
    }

    // Buscar todos os motoristas reais cadastrados
    const fetchDrivers = async () => {
      const drivers = await driverService.getAll();
      setAllDrivers(drivers);
    };
    fetchDrivers();

    // Escutar mudanças nas solicitações do usuário em tempo real
    let unsubscribe = null;
    if (user?.id) {
      unsubscribe = rideRequestService.onUserRequestsChange(user.id, (requests) => {
        setRideRequests(requests);
        const priceProposedRequest = requests.find(r => r.status === "priceProposed");
        if (priceProposedRequest && rideStatus === "waitingPrice") {
          setDriverPrice(priceProposedRequest.proposedPrice);
          setSelectedDriver(priceProposedRequest.driver);
          setRideStatus("priceReceived");
        }
      });
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.id, rideStatus]);

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
    try {
      // Buscar todos os motoristas reais cadastrados
      let driversList = allDrivers;
      // Se localização do passageiro e do motorista existirem, calcular distância
      if (currentLocation) {
        driversList = driversList.map(driver => {
          if (driver.location && driver.location.lat && driver.location.lng) {
            const dist = getDistanceKm(currentLocation.lat, currentLocation.lng, driver.location.lat, driver.location.lng)
            return { ...driver, distance: `${dist.toFixed(2)} km` }
          }
          return { ...driver, distance: 'N/A' }
        })
        // Ordenar por menor distância
        driversList = driversList.sort((a, b) => {
          if (a.distance === 'N/A') return 1;
          if (b.distance === 'N/A') return -1;
          return parseFloat(a.distance) - parseFloat(b.distance);
        })
      }
      setAvailableDrivers(driversList)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      setRideStatus('idle')
      alert('Erro ao buscar motoristas. Tente novamente.')
    }
  }

  const selectDriver = async (driver) => {
    setSelectedDriver(driver)
    setRideStatus('waitingPrice')
    
    try {
      // Criar solicitação de corrida no Firestore
      const rideRequest = {
        userId: user.id,
        userName: user.name,
        userPhone: user.phone,
        driverId: driver.id,
        driver: driver,
        origin: originStreet,
        destination: destination,
        status: 'waitingPrice'
      }
      
      await rideRequestService.create(rideRequest);
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
      alert('Erro ao enviar solicitação. Tente novamente.');
      setRideStatus('requesting');
    }
  }

  const acceptPrice = async () => {
    if (!paymentMethod) {
      alert('Por favor, selecione uma forma de pagamento!')
      return
    }

    try {
      setRideStatus('matched')
      
      // Buscar a solicitação atual do usuário
      const userRequests = await rideRequestService.getByUser(user.id);
      const currentRequest = userRequests.find(r => r.status === 'priceProposed');
      
      if (currentRequest) {
        // Atualizar status da solicitação no Firestore
        await rideRequestService.update(currentRequest.id, {
          status: 'accepted',
          paymentMethod: paymentMethod,
          acceptedPrice: driverPrice
        });
      }
    } catch (error) {
      console.error('Erro ao aceitar preço:', error);
      alert('Erro ao aceitar preço. Tente novamente.');
      setRideStatus('priceReceived');
    }
  }

  const rejectPrice = async () => {
    try {
      // Buscar a solicitação atual do usuário
      const userRequests = await rideRequestService.getByUser(user.id);
      const currentRequest = userRequests.find(r => r.status === 'priceProposed');
      
      if (currentRequest) {
        // Atualizar status da solicitação no Firestore
        await rideRequestService.update(currentRequest.id, {
          status: 'rejected'
        });
      }
      
      // Voltar para seleção de motoristas
      setRideStatus('requesting')
      setSelectedDriver(null)
      setDriverPrice(null)
      setPaymentMethod('')
    } catch (error) {
      console.error('Erro ao rejeitar preço:', error);
      alert('Erro ao rejeitar preço. Tente novamente.');
    }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur shadow-md border-b rounded-b-2xl">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-200 to-blue-400 rounded-full flex items-center justify-center shadow">
              <User className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900">Olá, {user.name}</h1>
              <p className="text-xs text-gray-500">Bem-vindo ao Uber Rio Pardo</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onLogout} className="hover:bg-red-50">
            <LogOut className="w-5 h-5 text-red-500" />
          </Button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Mapa ao vivo com localização do usuário e motoristas */}
        <Card className="shadow-lg border-0 bg-white/90 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <MapPin className="w-5 h-5" />
              <span className="font-semibold">Mapa ao Vivo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LiveMap
              center={currentLocation ? [currentLocation.lat, currentLocation.lng] : undefined}
              markers={[
                ...(currentLocation ? [{ lat: currentLocation.lat, lng: currentLocation.lng, label: 'Você' }] : []),
                ...allDrivers.filter(d => d.location).map(d => ({ lat: d.location.lat, lng: d.location.lng, label: d.name }))
              ]}
            />
          </CardContent>
        </Card>


        {/* Solicitação de Corrida */}
        <Card className="shadow-lg border-0 bg-white/90 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Navigation className="w-5 h-5" />
              <span className="font-semibold">Solicitar corrida</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="origin">Endereço de origem</Label>
                <Input
                  id="origin"
                  type="text"
                  placeholder="Digite o endereço de origem"
                  value={originStreet}
                  onChange={e => setOriginStreet(e.target.value)}
                  disabled={rideStatus !== 'idle'}
                  required
                  className="rounded-xl shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Endereço de destino</Label>
                <Input
                  id="destination"
                  type="text"
                  placeholder="Digite o endereço de destino"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  disabled={rideStatus !== 'idle'}
                  required
                  className="rounded-xl shadow-sm"
                />
              </div>
            </div>

            {rideStatus === 'idle' && (
              <Button 
                onClick={requestRide}
                className="w-full bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white font-bold py-2 rounded-xl shadow"
                disabled={loading || !originStreet.trim() || !destination.trim()}
              >
                {loading ? 'Procurando...' : 'Buscar Motoristas'}
              </Button>
            )}

            {rideStatus !== 'idle' && rideStatus !== 'inProgress' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold">{getRideStatusText()}</span>
                </div>
                <Button 
                  onClick={cancelRide}
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 font-semibold rounded-xl"
                >
                  Cancelar corrida
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de Motoristas Reais Cadastrados */}
        {rideStatus === 'requesting' && availableDrivers.length > 0 && (
          <Card className="shadow-lg border-0 bg-white/90 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-blue-700 font-semibold">Motoristas Reais Cadastrados</CardTitle>
              <CardDescription className="text-gray-500">Selecione um motorista para solicitar o preço da corrida</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {availableDrivers.map((driver) => (
                <div
                  key={driver.id}
                  onClick={() => selectDriver(driver)}
                  className="p-3 border border-blue-100 bg-blue-50/60 rounded-xl hover:bg-blue-100 cursor-pointer transition-colors shadow-sm flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                      <Car className="w-5 h-5 text-blue-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{driver.name}</p>
                      <p className="text-xs text-gray-600">{driver.vehicle}</p>
                      <p className="text-xs text-gray-500">Placa: {driver.plate}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-gray-600">{driver.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-700">{driver.distance}</p>
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

        {/* Corrida Confirmada + Chat */}
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

              {/* Chat Passageiro/Motorista */}
              <div className="p-3 bg-white border border-blue-200 rounded-2xl shadow-inner">
                <div className="mb-2 font-semibold text-blue-700 flex items-center gap-2"><User className="w-4 h-4" />Chat com o motorista</div>
                <div style={{maxHeight:200,overflowY:'auto',marginBottom:8}}>
                  {chatMessages.length === 0 && <div className="text-xs text-gray-400">Nenhuma mensagem ainda.</div>}
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={msg.type==='user' ? 'flex justify-end' : 'flex justify-start'}>
                      <span className={
                        'inline-block px-3 py-2 rounded-2xl text-xs m-1 max-w-[70%] break-words ' +
                        (msg.type==='user' ? 'bg-blue-200 text-blue-900' : 'bg-green-100 text-green-900')
                      }>
                        <b>{msg.senderName}:</b> {msg.text}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={chatInput}
                    onChange={e=>setChatInput(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    onKeyDown={e=>{if(e.key==='Enter'){handleSendMessage()}}}
                    className="rounded-full shadow-sm"
                  />
                  <Button onClick={handleSendMessage} disabled={!chatInput.trim()} className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-4">Enviar</Button>
                </div>
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

        {/* Status da Corrida em Andamento + Chat */}
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

              {/* Chat Passageiro/Motorista */}
              <div className="p-3 bg-white border border-green-200 rounded-2xl shadow-inner mt-2">
                <div className="mb-2 font-semibold text-green-700 flex items-center gap-2"><User className="w-4 h-4" />Chat com o motorista</div>
                <div style={{maxHeight:200,overflowY:'auto',marginBottom:8}}>
                  {chatMessages.length === 0 && <div className="text-xs text-gray-400">Nenhuma mensagem ainda.</div>}
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={msg.type==='user' ? 'flex justify-end' : 'flex justify-start'}>
                      <span className={
                        'inline-block px-3 py-2 rounded-2xl text-xs m-1 max-w-[70%] break-words ' +
                        (msg.type==='user' ? 'bg-blue-200 text-blue-900' : 'bg-green-100 text-green-900')
                      }>
                        <b>{msg.senderName}:</b> {msg.text}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={chatInput}
                    onChange={e=>setChatInput(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    onKeyDown={e=>{if(e.key==='Enter'){handleSendMessage()}}}
                    className="rounded-full shadow-sm"
                  />
                  <Button onClick={handleSendMessage} disabled={!chatInput.trim()} className="rounded-full bg-green-600 hover:bg-green-700 text-white font-bold px-4">Enviar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

