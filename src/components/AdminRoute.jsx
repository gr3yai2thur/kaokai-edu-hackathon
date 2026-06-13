import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
  </div>
);

export default function AdminRoute() {
  const { isAdmin, isLoadingAuth, role } = useAuth();

  // Wait for both auth AND role to load
  if (isLoadingAuth || role === null) return <Spinner />;

  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}
