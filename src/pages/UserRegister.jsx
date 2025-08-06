import { useState } from 'react'
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Criar usuário no Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user
      
      // Atualizar perfil do usuário
      await updateProfile(user, {
        displayName: formData.name
      })

      // Criar objeto do usuário
      const newUser = {
        id: user.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        type: 'user',
        createdAt: new Date().toISOString()
      }

      // Salvar no Firestore
      await userService.create(newUser);

      // Salvar o ID do usuário logado no localStorage
      localStorage.setItem("currentUserId", user.uid);
      
      alert('Cadastro realizado com sucesso!')
      onRegister(newUser)
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
              Crie sua conta para solicitar corridas
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                className="w-full bg-blue-600 hover:bg-blue-700"
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