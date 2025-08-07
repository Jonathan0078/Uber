import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Car } from 'lucide-react'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '../firebase'
import { driverService } from '../services/firestoreService'

export default function DriverRegister({ onBack, onRegister }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: Google, 2: Formulário
  const [driverData, setDriverData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    vehicle: '',
    plate: '',
    cnh: '',
    year: '',
    pixKey: '',
    provider: 'google',
    type: 'driver',
    available: false,
    trips: 0,
    rating: '5.0',
    createdAt: '',
    photoURL: null
  })


  const handleGoogleRegister = async () => {
    setLoading(true)
    setError('')
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      setDriverData(prev => ({
        ...prev,
        id: user.uid,
        name: user.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || null
      }))
      setStep(2)
    } catch (error) {
      let errorMessage = "Erro ao registrar com Google. Tente novamente."
      switch (error.code) {
        case "auth/popup-closed-by-user":
        case "auth/cancelled-popup-request":
          errorMessage = "Registro cancelado. Por favor, tente novamente.";
          break;
        case "auth/operation-not-allowed":
          errorMessage = "O método de registro não está ativado no Firebase.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
          break;
        default:
          errorMessage = error.message;
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setDriverData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    // Validação simples
    if (!driverData.plate || !driverData.cnh || !driverData.vehicle || !driverData.year) {
      setError('Preencha todos os campos obrigatórios.')
      setLoading(false)
      return
    }
    try {
      // Verifica se já existe
      const existingDriver = await driverService.getById(driverData.id)
      if (existingDriver) {
        await driverService.update(driverData.id, driverData)
      } else {
        await driverService.create(driverData)
      }
      localStorage.setItem("currentDriverId", driverData.id)
      onRegister(driverData)
    } catch (error) {
      setError('Erro ao salvar cadastro. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Car className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Cadastro do Motorista</CardTitle>
            <CardDescription>
              {step === 1 ? 'Crie sua conta com Google para aceitar corridas' : 'Complete seu cadastro para continuar'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            {step === 1 && (
              <Button 
                onClick={handleGoogleRegister}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Registrando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Registrar com Google</span>
                  </div>
                )}
              </Button>
            )}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <input type="text" name="name" value={driverData.name} onChange={handleChange} className="mt-1 block w-full rounded border-gray-300" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Placa</label>
                  <input type="text" name="plate" value={driverData.plate} onChange={handleChange} className="mt-1 block w-full rounded border-gray-300" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CNH</label>
                  <input type="text" name="cnh" value={driverData.cnh} onChange={handleChange} className="mt-1 block w-full rounded border-gray-300" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Modelo do Veículo</label>
                  <input type="text" name="vehicle" value={driverData.vehicle} onChange={handleChange} className="mt-1 block w-full rounded border-gray-300" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ano</label>
                  <input type="number" name="year" value={driverData.year} onChange={handleChange} className="mt-1 block w-full rounded border-gray-300" required />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded">
                  {loading ? 'Salvando...' : 'Finalizar Cadastro'}
                </button>
              </form>
            )}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Ao continuar, você concorda com nossos termos de uso
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



