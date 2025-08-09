import React, { useState } from 'react';
import MobileUserSelector from './components/MobileUserSelector.jsx';
import MobilePassengerDashboard from './components/MobilePassengerDashboard.jsx';
import MobileDriverDashboard from './components/MobileDriverDashboard.jsx';
import './App.css';
import './styles/mobile-native.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleUserSelect = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div className="mobile-container">
      {!currentUser ? (
        <MobileUserSelector onUserSelect={handleUserSelect} />
      ) : currentUser.user_type === 'passenger' ? (
        <MobilePassengerDashboard user={currentUser} onLogout={handleLogout} />
      ) : (
        <MobileDriverDashboard user={currentUser} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
