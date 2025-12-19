import React, { useState, useEffect } from 'react';
import { AppProvider } from './contexts/AppContext';
import Dashboard from './components/Dashboard';
import ClientView from './components/ClientView';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Simple Router Logic
  let ComponentToRender = <Dashboard />;
  
  if (currentRoute.startsWith('#/client/')) {
    const projectId = currentRoute.split('#/client/')[1];
    ComponentToRender = <ClientView projectId={projectId} />;
  } else {
    ComponentToRender = <Dashboard />;
  }

  return (
    <AppProvider>
      {ComponentToRender}
    </AppProvider>
  );
};

export default App;