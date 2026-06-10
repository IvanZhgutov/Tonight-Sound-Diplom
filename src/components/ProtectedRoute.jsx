import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Пускает на страницу только авторизованных, иначе — на /login
export default function ProtectedRoute({ children }) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
