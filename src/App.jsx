import { useState, useEffect } from 'react'
import ProfileSelection from './pages/ProfileSelection'
import UserLogin from './pages/UserLogin'
import UserRegister from './pages/UserRegister'
import UserProfile from './pages/UserProfile'
import UserDashboard from './pages/UserDashboard'
import DriverLogin from './pages/DriverLogin'
import DriverRegister from './pages/DriverRegister'
import DriverDashboard from './pages/DriverDashboard'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('profile-selection')
  const [currentUser, setCurrentUser] = useState(null)
  const [currentDriver, setCurrentDriver] = useState(null)

  useEffect(() => {
    // Verificar se há usuário logado
    const savedUser = localStorage.getItem('currentUser')
    const savedDriver = localStorage.getItem('currentDriver')
    
    if (savedUser) {
      const user = JSON.parse(savedUser)
      setCurrentUser(user)
      setCurrentView('user-dashboard')
    } else if (savedDriver) {
      const driver = JSON.parse(savedDriver)
      setCurrentDriver(driver)
      setCurrentView('driver-dashboard')
    }
  }, [])

  const handleProfileSelect = (profile) => {
    if (profile === 'user') {
      setCurrentView('user-login')
    } else {
      setCurrentView('driver-login')
    }
  }

  const handleUserLogin = (user) => {
    setCurrentUser(user)
    // Se o usuário logou com Google e não tem telefone, vai para o perfil
    if (user.provider === 'google' && !user.phone) {
      setCurrentView('user-profile')
    } else {
      setCurrentView('user-dashboard')
    }
  }

  const handleDriverLogin = (driver) => {
    setCurrentDriver(driver)
    setCurrentView('driver-dashboard')
  }

  const handleUserRegister = (user) => {
    setCurrentUser(user)
    setCurrentView('user-dashboard')
  }

  const handleDriverRegister = (driver) => {
    setCurrentDriver(driver)
    setCurrentView('driver-dashboard')
  }

  const handleProfileComplete = (user) => {
    setCurrentUser(user)
    setCurrentView('user-dashboard')
  }

  const handleUserLogout = () => {
    localStorage.removeItem('currentUser')
    setCurrentUser(null)
    setCurrentView('profile-selection')
  }

  const handleDriverLogout = () => {
    localStorage.removeItem('currentDriver')
    setCurrentDriver(null)
    setCurrentView('profile-selection')
  }

  const handleBack = () => {
    setCurrentView('profile-selection')
  }

  switch (currentView) {
    case 'profile-selection':
      return <ProfileSelection onProfileSelect={handleProfileSelect} />
    
    case 'user-login':
      return (
        <UserLogin 
          onBack={handleBack}
          onLogin={handleUserLogin}
          onRegister={() => setCurrentView('user-register')}
        />
      )
    
    case 'user-register':
      return (
        <UserRegister 
          onBack={() => setCurrentView('user-login')}
          onRegister={handleUserRegister}
        />
      )
    
    case 'user-profile':
      return (
        <UserProfile 
          user={currentUser}
          onProfileComplete={handleProfileComplete}
        />
      )
    
    case 'user-dashboard':
      return (
        <UserDashboard 
          user={currentUser}
          onLogout={handleUserLogout}
        />
      )
    
    case 'driver-login':
      return (
        <DriverLogin 
          onBack={handleBack}
          onLogin={handleDriverLogin}
          onRegister={() => setCurrentView('driver-register')}
        />
      )
    
    case 'driver-register':
      return (
        <DriverRegister 
          onBack={() => setCurrentView('driver-login')}
          onRegister={handleDriverRegister}
        />
      )
    
    case 'driver-dashboard':
      return (
        <DriverDashboard 
          driver={currentDriver}
          onLogout={handleDriverLogout}
        />
      )
    
    default:
      return <ProfileSelection onProfileSelect={handleProfileSelect} />
  }
}

export default App

