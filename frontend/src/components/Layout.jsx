import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Ticket, Users, LayoutDashboard, PlusCircle } from 'lucide-react';

const NAV_LINK = {
  base: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '9px 12px', borderRadius: '8px', textDecoration: 'none',
    fontSize: '14px', fontWeight: 500, transition: 'all 0.12s', position: 'relative',
  },
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const adminLinks = [
    { to: '/admin',         label: 'Dashboard',    icon: LayoutDashboard },
    { to: '/admin/tickets', label: 'All Tickets',  icon: Ticket },
    { to: '/admin/users',   label: 'Manage Users', icon: Users },
  ];
  const userLinks = [
    { to: '/dashboard',   label: 'My Tickets', icon: Ticket },
    { to: '/tickets/new', label: 'New Ticket', icon: PlusCircle },
  ];

  const links = user?.role === 'ADMIN' ? adminLinks : userLinks;
  const initials = user?.name?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>

      {/* ── Top Header ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '64px', zIndex: 40,
        background: '#FFFFFF', borderBottom: '1px solid #E2E8F0',
        display: 'flex', alignItems: 'center', padding: '0 24px',
        boxShadow: '0 1px 3px rgba(15,23,42,0.05)',
      }}>
        {/* Brand — same width as sidebar */}
        <div style={{ width: '216px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <img src="/logo.png" alt="Overdime HelpDesk" style={{ height: '52px', width: 'auto', objectFit: 'contain', flexShrink: 0 }} />
          <p style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>HelpDesk</p>
        </div>

        <div style={{ flex: 1 }} />

        {/* User pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '6px 14px 6px 8px', borderRadius: '10px',
          border: '1px solid #E2E8F0', background: '#F8FAFC',
        }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg,#2563EB,#7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '12px', fontWeight: 700,
          }}>
            {initials}
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', lineHeight: 1.3 }}>{user?.name}</p>
            <p style={{ fontSize: '11px', color: '#94A3B8', lineHeight: 1 }}>
              {user?.role === 'ADMIN' ? 'Administrator' : 'Member'}
            </p>
          </div>
        </div>
      </header>

      {/* ── Sidebar ── */}
      <aside style={{
        position: 'fixed', top: '64px', left: 0, bottom: 0, width: '240px', zIndex: 30,
        background: '#FFFFFF', borderRight: '1px solid #E2E8F0',
        display: 'flex', flexDirection: 'column',
      }}>
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          <p style={{
            fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.07em', color: '#94A3B8', padding: '0 12px', marginBottom: '8px',
          }}>
            {user?.role === 'ADMIN' ? 'Administration' : 'Support'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {links.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link key={to} to={to}
                  style={{
                    ...NAV_LINK.base,
                    color: active ? '#2563EB' : '#475569',
                    fontWeight: active ? 600 : 500,
                    background: active ? '#EFF6FF' : 'transparent',
                  }}
                  onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#0F172A'; } }}
                  onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; } }}>
                  {active && (
                    <span style={{
                      position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                      width: '3px', height: '22px', background: '#2563EB', borderRadius: '0 4px 4px 0',
                    }} />
                  )}
                  <Icon style={{ width: '16px', height: '16px', color: active ? '#2563EB' : '#94A3B8', flexShrink: 0 }} />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px', borderTop: '1px solid #E2E8F0' }}>
          <button onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
              padding: '9px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: 500, color: '#64748B', background: 'transparent',
              transition: 'all 0.12s', textAlign: 'left',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B'; }}>
            <LogOut style={{ width: '15px', height: '15px', flexShrink: 0 }} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={{ marginLeft: '240px', marginTop: '64px', minHeight: 'calc(100vh - 64px)' }}>
        <div style={{ padding: '32px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
