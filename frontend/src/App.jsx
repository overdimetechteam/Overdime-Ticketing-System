import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import UserDashboard from './pages/user/Dashboard';
import NewTicket from './pages/user/NewTicket';
import TicketDetail from './pages/user/TicketDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import AllTickets from './pages/admin/AllTickets';
import ManageUsers from './pages/admin/ManageUsers';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen text-slate-400">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { user } = useAuth();
  if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return children;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />

          {/* User routes */}
          <Route path="/dashboard" element={<RequireAuth><UserDashboard /></RequireAuth>} />
          <Route path="/tickets/new" element={<RequireAuth><NewTicket /></RequireAuth>} />
          <Route path="/tickets/:id" element={<RequireAuth><TicketDetail /></RequireAuth>} />

          {/* Admin routes */}
          <Route path="/admin" element={<RequireAuth><RequireAdmin><AdminDashboard /></RequireAdmin></RequireAuth>} />
          <Route path="/admin/tickets" element={<RequireAuth><RequireAdmin><AllTickets /></RequireAdmin></RequireAuth>} />
          <Route path="/admin/users" element={<RequireAuth><RequireAdmin><ManageUsers /></RequireAdmin></RequireAuth>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
