import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Phone } from 'lucide-react'

export default function UserProfile({ user, onProfileComplete }) {
  const [phone, setPhone] = useState(user.phone || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!phone.trim()) {
      setError('Por favor, informe seu telefone.')
      setLoading(false)
      return
    }

    try {
      // Atualizar dados do usuário
      const updatedUser = {
        ...user,
        phone: phone.trim()
      }

      // Atualizar no localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u)
      localStorage.setItem('users', JSON.stringify(updatedUsers))
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))

      onProfileComplete(updatedUser)
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      setError('Erro ao salvar perfil. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-blue-600" />
              )}
            </div>
            <CardTitle className="text-2xl">Complete seu Perfil</CardTitle>
            <CardDescription>
              Olá, {user.name}! Complete suas informações para continuar
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
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  value={user.name}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">Nome obtido do Google</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">Email obtido do Google</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(51) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Continuar'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Suas informações são seguras e utilizadas apenas para melhorar sua experiência
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

