import { useEffect, useState } from 'react';
import { useAuthenticatedUser } from '../hooks/useAuthenticatedUser';
import '../styles/userDashboard.css';

function UserDashboard() {
  const { user, accessToken, isLoading, isAuthenticated } = useAuthenticatedUser();
  const [datosFinancieros, setDatosFinancieros] = useState(null);

  const cargarDatos = async () => {
    if (!isAuthenticated || !accessToken) return;

    try {
      console.log('🔄 Sincronizando ingresos y gastos automáticamente...');
      const response = await fetch('/api/dashboard-metrics', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDatosFinancieros(data);
      }
    } catch (error) {
      console.error('Error al actualizar el dashboard:', error);
    }
  };

  useEffect(() => {
    if (accessToken) {
      cargarDatos();
    }

    const intervalo = setInterval(() => {
      cargarDatos();
    }, 120000);

    return () => clearInterval(intervalo);
  }, [accessToken, isAuthenticated]);

  if (isLoading) return <div className="dashboard-container">Loading auth state...</div>;

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Welcome, {user?.name}</h1>
      
      {/* <p className="token-status">
        Access Token:{' '}
        <span className={accessToken ? 'connected' : 'missing'}>
          {accessToken ? '✅ Connected' : '❌ Not available'}
        </span>
      </p> */}
      
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
}

export default UserDashboard;