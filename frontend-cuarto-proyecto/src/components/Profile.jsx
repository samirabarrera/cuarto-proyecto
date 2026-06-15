import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';

export default function Profile() {
  const { user, logout, isLoading } = useAuth0();
  const navigate = useNavigate();

  const handleLogout = () =>
    logout({ logoutParams: { returnTo: window.location.origin } });

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <span>Cargando perfil…</span>
      </div>
    );
  }

  return (
    <div className="ff-page">
      <div className="container" style={{ maxWidth: '480px', paddingTop: '3rem' }}>

        {/* Card de perfil */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'Inter, sans-serif',
        }}>

          {/* Avatar */}
          {user?.picture ? (
            <img
              src={user.picture}
              alt={user.name}
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                border: '2px solid var(--border)',
                marginBottom: '1rem',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'var(--bg-input)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '2rem',
            }}>
              👤
            </div>
          )}

          {/* Nombre y email */}
          <h2 style={{
            color: 'var(--text-primary)',
            fontWeight: 700,
            fontSize: '1.25rem',
            marginBottom: '0.25rem',
          }}>
            {user?.name ?? 'Usuario'}
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.88rem',
            marginBottom: '2rem',
          }}>
            {user?.email}
          </p>

          {/* Botones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                width: '100%',
                padding: '0.7rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
              onMouseEnter={e => e.target.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => e.target.style.borderColor = 'var(--border)'}
            >
              <i className="bi bi-grid-fill me-2" />
              Ir al Dashboard
            </button>

            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '0.7rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(239,68,68,0.3)',
                background: 'transparent',
                color: '#ef4444',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
              onMouseEnter={e => e.target.style.background = 'rgba(239,68,68,0.08)'}
              onMouseLeave={e => e.target.style.background = 'transparent'}
            >
              <i className="bi bi-box-arrow-right me-2" />
              Cerrar Sesión
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
