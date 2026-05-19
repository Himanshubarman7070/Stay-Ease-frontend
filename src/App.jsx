import { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import { pingServer } from './services/api';

export default function App() {
  useEffect(() => {
    // Warm up Render backend on first load so login is ready
    pingServer();
  }, []);

  return <AppRoutes />;
}
