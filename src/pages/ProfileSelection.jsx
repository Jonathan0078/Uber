import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Car, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const ProfileSelection = () => {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const navigate = useNavigate();

  const profiles = [
    {
      id: 'user',
      title: 'Sou Passageiro',
      description: 'Solicite corridas e chegue ao seu destino',
      icon: User,
      color: 'purple',
      route: '/login'
    },
    {
      id: 'driver',
      title: 'Sou Motorista',
      description: 'Aceite corridas e ganhe dinheiro dirigindo',
      icon: Car,
      color: 'green',
      route: '/motorista/login'
    }
  ];

  const handleProfileSelect = (profileId) => {
    setSelectedProfile(profileId);
  };

  const handleContinue = () => {
    const profile = profiles.find(p => p.id === selectedProfile);
    if (profile) {
      navigate(profile.route);
    }
  };

  const getCardClasses = (profile) => {
    const baseClasses = "cursor-pointer transition-all duration-300 hover:shadow-lg border-2";
    
    if (selectedProfile === profile.id) {
      return `${baseClasses} ${
        profile.color === 'purple' 
          ? 'border-purple-500 bg-purple-50' 
          : 'border-green-500 bg-green-50'
      }`;
    }
    
    return `${baseClasses} border-gray-200 hover:border-gray-300`;
  };

  const getIconClasses = (profile) => {
    if (selectedProfile === profile.id) {
      return profile.color === 'purple' ? 'text-purple-600' : 'text-green-600';
    }
    return 'text-gray-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <div className="text-center py-8 px-4">
        <div className="flex justify-center items-center mb-4">
          <div className="bg-blue-600 p-3 rounded-full">
            <Car className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Uber Rio Pardo
        </h1>
        <p className="text-lg text-gray-600">
          Escolha seu perfil para continuar
        </p>
      </div>

      {/* Profile Selection Cards */}
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-4xl">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {profiles.map((profile) => {
              const IconComponent = profile.icon;
              
              return (
                <Card
                  key={profile.id}
                  className={getCardClasses(profile)}
                  onClick={() => handleProfileSelect(profile.id)}
                >
                  <CardContent className="p-8 text-center">
                    <div className="mb-6">
                      <div className="inline-flex p-4 rounded-full bg-gray-100 mb-4">
                        <IconComponent 
                          className={`h-12 w-12 ${getIconClasses(profile)}`}
                        />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {profile.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed">
                      {profile.description}
                    </p>
                    
                    {selectedProfile === profile.id && (
                      <div className="mt-4">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          profile.color === 'purple' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          Selecionado
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Continue Button */}
          {selectedProfile && (
            <div className="mt-8 text-center">
              <Button
                onClick={handleContinue}
                size="lg"
                className={`px-8 py-3 text-lg font-medium transition-all duration-300 ${
                  selectedProfile === 'user'
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                Continuar como {profiles.find(p => p.id === selectedProfile)?.title}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 px-4 border-t border-gray-200 bg-white/50">
        <p className="text-sm text-gray-500">
          Desenvolvido para Rio Pardo/RS com ❤️
        </p>
      </div>
    </div>
  );
};

export default ProfileSelection;

