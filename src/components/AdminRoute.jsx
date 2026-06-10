import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Только для администратора
export default function AdminRoute({ children }) {
  const user = useAuthStore((s) => s.user);

  if (!user) return <Navigate to="/login" replace state={{ from: '/admin' }} />;
  if (!user.isAdmin) return <Navigate to="/" replace />;
  return children;
}
