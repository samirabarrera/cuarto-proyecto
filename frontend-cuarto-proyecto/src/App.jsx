import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';
import Profile from './Profile';
import UserDashboard from './components/UserDashboard';
import './index.css';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth0();
  
  if (isLoading) {
    return (
      <div className="app-container">
        <div className="loading-state">
          <div className="loading-text">Loading session...</div>
        </div>
      </div>
    );
  }
  
  // Si está logueado muestra la página; si no, lo rebota a la raíz
  return isAuthenticated ? children : <Navigate to="/" />;
}

function App() {
  const { isAuthenticated, isLoading, error } = useAuth0();

  if (isLoading) {
    return (
      <div className="app-container">
        <div className="loading-state">
          <div className="loading-text">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="error-state">
          <div className="error-title">Oops!</div>
          <div className="error-message">{error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <div className="app-container">
                <div className="main-card-wrapper">
                  <img 
                    src="https://cdn.auth0.com/quantum-assets/dist/latest/logos/auth0/auth0-lockup-en-ondark.png" 
                    alt="Auth0 Logo" 
                    className="auth0-logo"
                  />
                  <h1 className="main-title">Welcome to your Expense Tracker</h1>
                  <div className="action-card">
                    <p className="action-text">Get started by signing in to your account</p>
                    <LoginButton />
                  </div>
                </div>
              </div>
            )
          } 
        />
        
        {/* Ruta Protegida: Tu panel financiero rosado */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Si escriben cualquier otra ruta inexistente, redirige al inicio */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;