import { useEffect, useState } from 'react';
import { useAuthenticatedUser } from '../hooks/useAuthenticatedUser';
import '../styles/variables.css';
import '../styles/UserDashboard.css';
import Navbar from './Navbar';
import Transactions from './Transactions';
import Profile from '../Profile';
import LogoutButton from '../LogoutButton';
import socket from '../hooks/socket';
import api, { setAuthToken, getSummary } from '../api/financeApi';

function UserDashboard() {
  const { user, accessToken, isLoading, isAuthenticated } = useAuthenticatedUser();
  const [datosFinancieros, setDatosFinancieros] = useState(null);

  // Estado para la barra de navegación y el socket
  const [activeView, setActiveView] = useState('dashboard');
  const [isConnected, setIsConnected] = useState(false);
  const [socketEvents, setSocketEvents] = useState(0);

  const cargarDatos = async () => {
    if (!isAuthenticated || !accessToken) return;

    try {
      console.log('🔄 Sincronizando ingresos y gastos automáticamente...');
      const mesActual = new Date().toISOString().slice(0, 7); 
      const response = await getSummary(mesActual);
      
      if (response.data) {
        // Adaptamos los datos para que coincidan con la vista anterior
        setDatosFinancieros({
          totalIngresos: response.data.monthly_income || response.data.data?.monthly_income || 0,
          totalGastos: response.data.monthly_expense || response.data.data?.monthly_expense || 0
        });
      }
    } catch (error) {
      console.error('Error al actualizar el dashboard:', error);
    }
  };

  useEffect(() => {
    if (accessToken) {
      // Configurar el token en Axios para todas las peticiones (Transactions, Goals, etc)
      setAuthToken(accessToken);
      cargarDatos();
    }

    const intervalo = setInterval(() => {
      if (accessToken) {
        setAuthToken(accessToken);
        cargarDatos();
      }
    }, 120000);

    return () => clearInterval(intervalo);
  }, [accessToken, isAuthenticated]);

  // Efecto para inicializar el socket y escuchar eventos
  useEffect(() => {
    setIsConnected(socket.connected);
    
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onUpdate = () => {
      setSocketEvents(prev => prev + 1);
      cargarDatos(); // Refrescar los datos del dashboard si llega un evento
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('finance_update', onUpdate);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('finance_update', onUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToast = (msg, type) => {
    // Componente Toast simple nativo o un alert
    alert(msg);
  };

  if (isLoading) return <div className="dashboard-container">Loading auth state...</div>;

  // Renderiza el contenido propio del Dashboard Financiero
  const renderDashboardContent = () => (
    <div className="dashboard-container" style={{ margin: '2rem auto' }}>
      <h1 className="dashboard-title">Welcome, {user?.name?.split(' ')[0] ?? user?.email ?? 'Usuario'}</h1>
      
      <hr className="dashboard-divider" />

      <h2 className="section-title">Resumen Financiero</h2>
      
      {datosFinancieros ? (
        <div className="metrics-grid">
          <div className="metric-card income">
            <h3>Ingresos</h3>
            <p>${datosFinancieros.totalIngresos || 0}</p>
          </div>
          
          <div className="metric-card expenses">
            <h3>Gastos</h3>
            <p>${datosFinancieros.totalGastos || 0}</p>
          </div>
        </div>
      ) : (
        <p className="waiting-message">Esperando datos del servidor...</p>
      )}
    </div>
  );

  return (
    <div style={{ overflowY: 'auto', maxHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#fffafb' }}>
      {/* Barra de navegación superior */}
      <Navbar activeView={activeView} onNavigate={setActiveView} isConnected={isConnected} />
      
      {/* Contenido principal según la vista seleccionada */}
      <div style={{ flex: 1 }}>
        {activeView === 'dashboard' && renderDashboardContent()}
        {activeView === 'transactions' && <Transactions socketEvents={socketEvents} onToast={handleToast} accessToken={accessToken} />}
      </div>

      {/* Pie de página con Perfil y Logout */}
      <div style={{ padding: '2rem', textAlign: 'center', borderTop: '2px solid #fed7e2' }}>
        <Profile />
        <div style={{ marginTop: '1rem' }}>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;