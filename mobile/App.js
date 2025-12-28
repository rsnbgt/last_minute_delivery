import React, { useState } from 'react';
import { View } from 'react-native';
import tw from 'twrnc';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DeliveryPage from './pages/DeliveryPage';
import HistoryPage from './pages/HistoryPage';

export default function App() {
  const [view, setView] = useState('login'); // 'login', 'register', 'delivery', 'history'
  const [agent, setAgent] = useState(null); // { id, name, email, mobile }

  // Navigation Handlers
  const handleLoginSuccess = (agentData) => {
    setAgent(agentData);
    setView('delivery');
  };

  const handleLogout = () => {
    setAgent(null);
    setView('login');
  };

  return (
    <View style={tw`flex-1 bg-gray-100`}>
      {view === 'login' && (
        <LoginPage
          onLogin={handleLoginSuccess}
          onNavigateRegister={() => setView('register')}
        />
      )}

      {view === 'register' && (
        <RegisterPage
          onNavigateLogin={() => setView('login')}
        />
      )}

      {view === 'delivery' && (
        <DeliveryPage
          agent={agent}
          onLogout={handleLogout}
          onNavigateHistory={() => setView('history')}
        />
      )}

      {view === 'history' && (
        <HistoryPage
          agent={agent}
          onBack={() => setView('delivery')}
        />
      )}
    </View>
  );
}
