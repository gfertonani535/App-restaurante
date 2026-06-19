import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';

export function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <span className="text-sm text-neutral-400">Cargando...</span>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
