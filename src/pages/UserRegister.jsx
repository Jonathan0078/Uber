import { useState } from 'react'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '../firebase'
import { userService } from '../services/firestoreService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, User } from 'lucide-react'

export default function UserRegister({ onBack, onRegister }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: escolha, 2: formulário Google, 3: formulário email
  const [googleUser, setGoogleUser] = useState(null)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleGoogleRegister = async () => {
    setLoading(true)
    setError('')
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      setGoogleUser(user)
      setFormData({
        name: user.displayName || '',
        email: user.email || '',
        phone: ''
      })
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

  const handleSubmitGoogle = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    if (!formData.name || !formData.phone) {
      setError('Preencha todos os campos obrigatórios.')
      setLoading(false)
      return
    }
    try {
      const userData = {
        id: googleUser.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        photoURL: googleUser.photoURL,
        provider: 'google',
        type: 'user',
        createdAt: new Date().toISOString()
      }
      const existingUser = await userService.getById(googleUser.uid)
      if (existingUser) {
        await userService.update(googleUser.uid, userData)
      } else {
        await userService.create(userData)
      }
      localStorage.setItem("currentUserId", googleUser.uid)
      alert('Cadastro realizado com sucesso!')
      onRegister(userData)
    } catch (error) {
      setError('Erro ao salvar cadastro. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitEmail = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // Criar usuário no Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user
      await updateProfile(user, { displayName: formData.name })
      const newUser = {
        id: user.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        type: 'user',
        createdAt: new Date().toISOString()
      }
      await userService.create(newUser)
      localStorage.setItem("currentUserId", user.uid)
      alert('Cadastro realizado com sucesso!')
      onRegister(newUser)
    } catch (error) {
      let errorMessage = 'Erro ao criar conta. Tente novamente.'
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este e-mail já está em uso.'
          break
        case 'auth/invalid-email':
          errorMessage = 'E-mail inválido.'
          break
        case 'auth/weak-password':
          errorMessage = 'A senha é muito fraca.'
          break
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
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
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Cadastro do Passageiro</CardTitle>
            <CardDescription>
              {step === 1 ? 'Escolha como deseja se cadastrar' : 'Complete seu cadastro para continuar'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-2">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            {step === 1 && (
              <div className="space-y-4">
                <Button onClick={handleGoogleRegister} className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                  {loading ? 'Carregando...' : 'Cadastrar com Google'}
                </Button>
                <div className="text-center text-sm text-gray-500">ou</div>
                <Button onClick={() => setStep(3)} className="w-full" variant="outline" disabled={loading}>
                  Cadastrar com Email e Senha
                </Button>
              </div>
            )}
            {step === 2 && (
              <form onSubmit={handleSubmitGoogle} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="(51) 99999-9999"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                  {loading ? 'Salvando...' : 'Finalizar Cadastro'}
                </Button>
              </form>
            )}
            {step === 3 && (
              <form onSubmit={handleSubmitEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="(51) 99999-9999"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Sua senha"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar senha</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirme sua senha"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                  {loading ? 'Cadastrando...' : 'Cadastrar'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}