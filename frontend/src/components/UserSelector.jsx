import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { User, Car } from 'lucide-react';

const UserSelector = ({ onUserSelect }) => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', email: '', user_type: 'passenger' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const createUser = async () => {
    if (!newUser.username || !newUser.email) {
      alert('Por favor, preencha nome e email');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        const user = await response.json();
        setUsers([...users, user]);
        setNewUser({ username: '', email: '', user_type: 'passenger' });
        alert('Usuário criado com sucesso!');
      } else {
        const error = await response.json();
        alert(`Erro: ${error.error}`);
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      alert('Erro ao criar usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bem-vindo ao Uber App
        </h1>
        <p className="text-gray-600">Selecione ou crie um usuário para continuar</p>
      </div>

      {/* Criar Novo Usuário */}
      <Card>
        <CardHeader>
          <CardTitle>Criar Novo Usuário</CardTitle>
          <CardDescription>
            Crie uma conta como passageiro ou motorista
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input
                placeholder="Seu nome"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Usuário</label>
            <div className="flex gap-4">
              <Button
                variant={newUser.user_type === 'passenger' ? 'default' : 'outline'}
                onClick={() => setNewUser({ ...newUser, user_type: 'passenger' })}
                className="flex-1"
              >
                <User className="h-4 w-4 mr-2" />
                Passageiro
              </Button>
              <Button
                variant={newUser.user_type === 'driver' ? 'default' : 'outline'}
                onClick={() => setNewUser({ ...newUser, user_type: 'driver' })}
                className="flex-1"
              >
                <Car className="h-4 w-4 mr-2" />
                Motorista
              </Button>
            </div>
          </div>
          
          <Button 
            onClick={createUser} 
            disabled={loading || !newUser.username || !newUser.email}
            className="w-full"
          >
            {loading ? 'Criando...' : 'Criar Usuário'}
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Usuários Existentes */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários Existentes</CardTitle>
          <CardDescription>
            Clique em um usuário para fazer login
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum usuário encontrado. Crie o primeiro usuário acima.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => onUserSelect(user)}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {user.user_type === 'passenger' ? (
                      <User className="h-8 w-8 text-blue-500" />
                    ) : (
                      <Car className="h-8 w-8 text-green-500" />
                    )}
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-400 capitalize">
                        {user.user_type === 'passenger' ? 'Passageiro' : 'Motorista'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSelector;

