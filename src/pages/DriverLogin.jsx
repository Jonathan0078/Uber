import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Car } from 'lucide-react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { driverService } from '../services/firestoreService'

export default function DriverLogin({ onBack, onLogin, onRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      console.log("Attempting login with email:", email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User logged in successfully:", user.uid);
      
      // Criar objeto do motorista com dados do Firebase
      const driverData = {
        id: user.uid,
        name: user.displayName || 'Motorista',
        email: user.email,
        phone: '',
        vehicle: '',
        plate: '',
        cnh: '',
        year: '',
        pixKey: '',
        provider: 'firebase',
        type: 'driver',
        available: false,
        trips: 0,
        rating: '5.0',
        createdAt: new Date().toISOString()
      };

      console.log("Checking for existing driver in Firestore...");
      // Buscar no Firestore se o motorista já existe
      const existingDriver = await driverService.getById(user.uid);
      if (existingDriver) {
        console.log("Driver found in Firestore, updating data.");
        // Atualizar dados do motorista no Firestore
        await driverService.update(user.uid, driverData);
        Object.assign(driverData, existingDriver); // Merge existing data
      } else {
        console.log("Driver not found in Firestore, creating new entry.");
        // Criar novo motorista no Firestore
        await driverService.create(driverData);
      }

      // Salvar o ID do motorista logado no localStorage
      localStorage.setItem("currentDriverId", user.uid);
      onLogin(driverData);
      console.log("Login process completed.");    } catch (error) {
      console.error("Erro no login:", error);
      let errorMessage = "Erro ao fazer login. Tente novamente.";

      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "Usuário não encontrado. Verifique o e-mail.";
          break;
        case "auth/wrong-password":
          errorMessage = "Senha incorreta.";
          break;
        case "auth/invalid-email":
          errorMessage = "E-mail inválido.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Muitas tentativas. Tente novamente mais tarde.";
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
            <CardTitle className="text-2xl">Login do Motorista</CardTitle>
            <CardDescription>
              Entre com sua conta para aceitar corridas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{' '}
                <button 
                  onClick={onRegister}
                  className="text-green-600 hover:underline font-medium"
                >
                  Cadastre-se
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

