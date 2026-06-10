import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Пускает на страницу только авторизованных, иначе — на /login.
// Пока сессия проверяется по токену — ничего не рендерим,
// чтобы не было ложного редиректа.
export default function ProtectedRoute({ children }) {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const location = useLocation();

  if (!initialized) return null;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
