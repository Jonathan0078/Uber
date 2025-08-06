import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Car } from 'lucide-react'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '../firebase'
import { driverService } from '../services/firestoreService'

export default function DriverLogin({ onBack, onLogin, onRegister }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError("")
    
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      
      // Criar objeto do usuário com dados do Google
      const driverData = {
        id: user.uid,
        name: user.displayName,
        email: user.email,
        phone: "",
        vehicle: "",
        cnh: "",
        year: "",
        pixKey: "",
        provider: 'google',
        type: 'driver',
        available: false,
        trips: 0,
        rating: '5.0',
        createdAt: new Date().toISOString(),
        photoURL: user.photoURL || null
      };

      console.log("Checking for existing driver in Firestore...");
      const existingDriver = await driverService.getById(user.uid);
      if (existingDriver) {
        console.log("Driver found in Firestore, updating data.");
        await driverService.update(user.uid, driverData);
        Object.assign(driverData, existingDriver); // Merge existing data
      } else {
        console.log("Driver not found in Firestore, creating new entry.");
        await driverService.create(driverData);
      }

      localStorage.setItem("currentDriverId", user.uid);
      onLogin(driverData);
      console.log("Google login process completed.");

    } catch (error) {
      console.error("Erro no login com Google:", error);
      setError("Erro ao fazer login com Google. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 text-center">
        <Button variant="ghost" onClick={onBack} className="absolute top-4 left-4">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <CardTitle className="text-2xl">Login do Motorista</CardTitle>
        <CardDescription>Faça login para continuar</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={loading}>
            {loading ? "Carregando..." : "Login com Google"}
          </Button>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </div>
        <div className="mt-4 text-center text-sm">
          Não tem uma conta?{" "}
          <a href="#" className="underline" onClick={onRegister}>
            Cadastre-se
          </a>
        </div>
      </CardContent>
    </Card>
  )
}


