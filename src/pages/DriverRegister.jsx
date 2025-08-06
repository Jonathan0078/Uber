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

  const handleGoogleRegister = async () => {
    setLoading(true)
    setError('')
    
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      
      // Criar objeto do motorista com dados do Google
      const driverData = {
        id: user.uid,
        name: user.displayName,
        email: user.email,
        phone: '', // Será preenchido no perfil
        vehicle: '',
        cnh: '',
        year: '',
        pixKey: '',
        provider: 'google',
        type: 'driver',
        available: false,
        trips: 0,
        rating: '5.0',
        createdAt: new Date().toISOString(),
        photoURL: user.photoURL || null
      }

      // Buscar no Firestore se o motorista já existe
      const existingDriver = await driverService.getById(user.uid);
      if (existingDriver) {
        // Se o motorista já existe, apenas atualiza (se necessário) e faz login
        await driverService.update(user.uid, driverData);
      } else {
        // Se não existe, cria um novo registro no Firestore
        await driverService.create(driverData);
      }

      // Salvar o ID do motorista logado no localStorage
      localStorage.setItem("currentDriverId", user.uid);
      
      onRegister(driverData)
    } catch (error) {
      console.error("Erro no registro com Google:", error);
      let errorMessage = "Erro ao registrar com Google. Tente novamente.";

      switch (error.code) {
        case "auth/popup-closed-by-user":
          errorMessage = "Registro cancelado. Por favor, tente novamente.";
          break;
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
          errorMessage = error.message; // Exibe a mensagem de erro do Firebase por padrão
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
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
              Crie sua conta com Google para aceitar corridas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
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



