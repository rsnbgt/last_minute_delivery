import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import tw from 'twrnc';
import Navbar from './components/Navbar';
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
    <SafeAreaProvider>
      <View style={tw`flex-1 bg-[#023859]`}>
        <Navbar />
        <View style={tw`flex-1`}>
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
      </View>
    </SafeAreaProvider>
  );
}
