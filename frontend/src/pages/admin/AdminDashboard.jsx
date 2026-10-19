import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { Ticket, AlertCircle, CheckCircle, Clock, Hash, ArrowUpRight, ArrowRight, TrendingUp, Cpu, AppWindow, Wifi, FileText, PlusCircle, ListChecks, Activity } from 'lucide-react';

const CARD = { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' };

const STAT_META = [
  { key: 'total',      label: 'Total Tickets', icon: Hash,        color: '#7C3AED', bg: '#F5F3FF', accent: '#7C3AED' },
  { key: 'open',       label: 'Open',          icon: AlertCircle, color: '#2563EB', bg: '#EFF6FF', accent: '#2563EB' },
  { key: 'inProgress', label: 'In Progress',   icon: Clock,       color: '#D97706', bg: '#FFFBEB', accent: '#F59E0B' },
  { key: 'resolved',   label: 'Resolved',      icon: CheckCircle, color: '#16A34A', bg: '#F0FDF4', accent: '#16A34A' },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats]   = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/tickets/stats'), api.get('/tickets/all?limit=5')])
      .then(([s, t]) => { setStats(s.data); setRecent(t.data.tickets); })
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const firstName = user?.name?.split(' ')[0] ?? 'Admin';

  // ── Category breakdown from recent ──
  const catCounts = recent.reduce((acc, t) => {
    const k = t.problemCategory || 'Uncategorised';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const catList = [
    { key: 'Hardware', icon: Cpu,        color: '#7C3AED', bg: '#F5F3FF' },
    { key: 'Software', icon: AppWindow,  color: '#2563EB', bg: '#EFF6FF' },
    { key: 'Network',  icon: Wifi,       color: '#0891B2', bg: '#ECFEFF' },
    { key: 'Other',    icon: FileText,   color: '#64748B', bg: '#F8FAFC' },
  ];
  const totalCategorised = catList.reduce((sum, c) => sum + (catCounts[c.key] || 0), 0) || 1;

  return (
    <Layout>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '24px', alignItems: 'flex-start' }}>
      <div>
      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>{today}</p>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>Welcome back, {firstName}</h1>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>Here's your support queue overview</p>
        </div>
        <Link to="/admin/tickets" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px', borderRadius: '8px', textDecoration: 'none',
          background: '#2563EB', color: '#fff', fontSize: '14px', fontWeight: 600,
          boxShadow: '0 2px 8px rgba(37,99,235,0.28)', transition: 'background 0.15s',
        }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#1D4ED8'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#2563EB'}>
          View All Tickets <ArrowUpRight style={{ width: '15px', height: '15px' }} />
        </Link>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '28px' }}>
        {loading
          ? [...Array(4)].map((_, i) => (
              <div key={i} style={{ ...CARD, padding: '24px', animation: 'pulse 1.5s ease-in-out infinite' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F1F5F9', marginBottom: '16px' }} />
                <div style={{ width: '60px', height: '32px', borderRadius: '6px', background: '#F1F5F9', marginBottom: '8px' }} />
                <div style={{ width: '80px', height: '13px', borderRadius: '4px', background: '#F1F5F9' }} />
              </div>
            ))
          : STAT_META.map(({ key, label, icon: Icon, color, bg, accent }) => (
              <div key={key} style={{ ...CARD, padding: '24px', borderTop: `3px solid ${accent}` }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Icon style={{ width: '17px', height: '17px', color }} />
                </div>
                <p style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', lineHeight: 1, marginBottom: '4px' }}>{stats?.[key] ?? 0}</p>
                <p style={{ fontSize: '13px', fontWeight: 500, color: '#64748B' }}>{label}</p>
              </div>
            ))}
      </div>

      {/* ── Recent tickets ── */}
      <div style={{ ...CARD, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #E2E8F0' }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>Recent Tickets</h2>
            <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Last 5 submitted</p>
          </div>
          <Link to="/admin/tickets" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600, color: '#2563EB', textDecoration: 'none' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#1D4ED8'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#2563EB'}>
            View all <ArrowRight style={{ width: '14px', height: '14px' }} />
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '80px', textAlign: 'center' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
          </div>
        ) : recent.length === 0 ? (
          <div style={{ padding: '80px 24px', textAlign: 'center' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Ticket style={{ width: '24px', height: '24px', color: '#94A3B8' }} />
            </div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>No tickets yet</p>
            <p style={{ fontSize: '13px', color: '#64748B' }}>Tickets will appear here once submitted</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  {['Ticket ID', 'Title', 'Submitted by', 'Category', 'Status', 'Date'].map((h) => (
                    <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748B', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((t, idx) => (
                  <tr key={t.id}
                    style={{ borderBottom: idx < recent.length - 1 ? '1px solid #F1F5F9' : 'none', transition: 'background 0.1s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 20px' }}>
                      <Link to={`/tickets/${t.id}`} style={{ display: 'inline-block', fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', textDecoration: 'none', color: '#2563EB', background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                        {t.ticketId}
                      </Link>
                    </td>
                    <td style={{ padding: '14px 20px', maxWidth: '240px' }}>
                      <Link to={`/tickets/${t.id}`} style={{ color: '#0F172A', textDecoration: 'none', fontWeight: 500, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#2563EB'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#0F172A'}>
                        {t.title}
                      </Link>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#2563EB,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                          {t.user?.name?.[0]?.toUpperCase()}
                        </div>
                        <span style={{ color: '#475569', whiteSpace: 'nowrap' }}>{t.user?.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {t.problemCategory ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#1D4ED8', background: '#EFF6FF', border: '1px solid #BFDBFE', whiteSpace: 'nowrap' }}>
                          {t.problemCategory}
                        </span>
                      ) : (
                        <span style={{ color: '#CBD5E1', fontSize: '12px' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 20px' }}><StatusBadge status={t.status} /></td>
                    <td style={{ padding: '14px 20px', color: '#94A3B8', whiteSpace: 'nowrap', fontSize: '12px' }}>
                      {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
      </div>

      {/* ── Right: Insights sidebar ── */}
      <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '88px' }}>

        {/* Category breakdown */}
        <div style={{ ...CARD, padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ListChecks style={{ width: '14px', height: '14px', color: '#2563EB' }} />
            </div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>Recent categories</p>
          </div>
          {loading ? (
            <div style={{ height: '120px', background: '#F1F5F9', borderRadius: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ) : recent.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#94A3B8' }}>No tickets yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {catList.map(({ key, icon: Icon, color, bg }) => {
                const count = catCounts[key] || 0;
                const pct = Math.round((count / totalCategorised) * 100);
                return (
                  <div key={key}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon style={{ width: '12px', height: '12px', color }} />
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>{key}</span>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>{count}</span>
                    </div>
                    <div style={{ height: '6px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.4s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div style={{ ...CARD, padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity style={{ width: '14px', height: '14px', color: '#16A34A' }} />
            </div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>Quick actions</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link to="/admin/tickets" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', textDecoration: 'none' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F1F5F9'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#F8FAFC'}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Review queue</span>
              <ArrowRight style={{ width: '14px', height: '14px', color: '#94A3B8' }} />
            </Link>
            <Link to="/admin/users" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', textDecoration: 'none' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F1F5F9'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#F8FAFC'}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Manage users</span>
              <ArrowRight style={{ width: '14px', height: '14px', color: '#94A3B8' }} />
            </Link>
          </div>
        </div>
      </aside>
      </div>
    </Layout>
  );
}
