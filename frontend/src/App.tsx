import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import LoginForm from './components/auth/LoginForm';
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';
import Dashboard from './components/sections/Dashboard';
import Patients from './components/sections/Patients';
import Doctors from './components/sections/Doctors';
import Appointments from './components/sections/Appointments';
import Inventory from './components/sections/Inventory';

function App() {
  const { user, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }


  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'patients':
        return <Patients />;
      case 'doctors':
        return <Doctors />;
      case 'appointments':
        return <Appointments />;
      case 'inventory':
        return <Inventory />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Navigation activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="flex-1 p-8">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}

export default App;