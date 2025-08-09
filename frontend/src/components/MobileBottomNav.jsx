import React from 'react';
import { Home, Map, User, Settings, Car, Navigation } from 'lucide-react';
import '../styles/mobile-native.css';

const MobileBottomNav = ({ activeTab, onTabChange, userType }) => {
  const passengerTabs = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'map', label: 'Mapa', icon: Map },
    { id: 'trips', label: 'Viagens', icon: Navigation },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  const driverTabs = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'map', label: 'Mapa', icon: Map },
    { id: 'rides', label: 'Corridas', icon: Car },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  const tabs = userType === 'driver' ? driverTabs : passengerTabs;

  return (
    <div className="bottom-navigation">
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        return (
          <button
            key={tab.id}
            className={`bottom-nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <IconComponent size={24} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default MobileBottomNav;

