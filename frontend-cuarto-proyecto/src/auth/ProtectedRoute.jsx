import { withAuthenticationRequired } from '@auth0/auth0-react';

// Este componente envuelve cualquier página que quieras hacer privada
export const ProtectedRoute = ({ component }) => {
  const Component = withAuthenticationRequired(component, {
    onRedirecting: () => (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Redirigiendo al inicio de sesión...
      </div>
    ),
  });

  return <Component />;
};