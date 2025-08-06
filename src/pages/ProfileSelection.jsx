import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Car } from 'lucide-react'

export default function ProfileSelection({ onProfileSelect }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Uber Rio Pardo</h1>
          <p className="text-gray-600">Escolha seu perfil para continuar</p>
        </div>
        
        <div className="space-y-4">
          <Card 
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-blue-500"
            onClick={() => onProfileSelect('user')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Passageiro</CardTitle>
              <CardDescription>
                Solicite uma corrida e chegue ao seu destino com segurança
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-green-500"
            onClick={() => onProfileSelect('driver')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Car className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Motorista</CardTitle>
              <CardDescription>
                Aceite corridas e ganhe dinheiro dirigindo pela cidade
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Serviço disponível apenas em Rio Pardo-RS</p>
        </div>
      </div>
    </div>
  )
}

