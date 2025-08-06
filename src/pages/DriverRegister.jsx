import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Car } from 'lucide-react'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../firebase'

export default function DriverRegister({ onBack, onRegister }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    cnh: '',
    vehicle: '',
    plate: '',
    year: '',
    pixKey: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem!')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres!')
      setLoading(false)
      return
    }

    try {
      // Criar usuário no Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user
      
      // Atualizar perfil do usuário
      await updateProfile(user, {
        displayName: formData.name
      })

      // Criar objeto do motorista
      const newDriver = {
        id: user.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        cnh: formData.cnh,
        vehicle: formData.vehicle,
        plate: formData.plate,
        year: formData.year,
        pixKey: formData.pixKey,
        provider: 'firebase',
        type: 'driver',
        available: false,
        trips: 0,
        rating: '5.0',
        createdAt: new Date().toISOString()
      }

      // Salvar no localStorage
      const drivers = JSON.parse(localStorage.getItem('drivers') || '[]')
      drivers.push(newDriver)
      localStorage.setItem('drivers', JSON.stringify(drivers))
      localStorage.setItem('currentDriver', JSON.stringify(newDriver))

      onRegister(newDriver)
    } catch (error) {
      console.error('Erro no cadastro:', error)
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
              Crie sua conta para aceitar corridas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="cnh">CNH</Label>
                <Input
                  id="cnh"
                  name="cnh"
                  type="text"
                  placeholder="Número da CNH"
                  value={formData.cnh}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle">Veículo</Label>
                <Input
                  id="vehicle"
                  name="vehicle"
                  type="text"
                  placeholder="Ex: Honda Civic"
                  value={formData.vehicle}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plate">Placa</Label>
                <Input
                  id="plate"
                  name="plate"
                  type="text"
                  placeholder="ABC-1234"
                  value={formData.plate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Ano do veículo</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  placeholder="2020"
                  value={formData.year}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pixKey">Chave PIX</Label>
                <Input
                  id="pixKey"
                  name="pixKey"
                  type="text"
                  placeholder="Email, telefone ou chave aleatória"
                  value={formData.pixKey}
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
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

