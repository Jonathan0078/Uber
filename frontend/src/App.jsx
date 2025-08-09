import React, { useState } from 'react';
import UserSelector from './components/UserSelector.jsx';
import PassengerDashboard from './components/PassengerDashboard.jsx';
import DriverDashboard from './components/DriverDashboard.jsx';
import { Button } from '@/components/ui/button.jsx';
import { LogOut } from 'lucide-react';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleUserSelect = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Uber App</h1>
            </div>
            {currentUser && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {currentUser.username} ({currentUser.user_type === 'passenger' ? 'Passageiro' : 'Motorista'})
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        {!currentUser ? (
          <UserSelector onUserSelect={handleUserSelect} />
        ) : currentUser.user_type === 'passenger' ? (
          <PassengerDashboard user={currentUser} />
        ) : (
          <DriverDashboard user={currentUser} />
        )}
      </main>
    </div>
  );
}

export default App;
