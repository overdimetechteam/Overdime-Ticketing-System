import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import { useAuth } from '../../context/AuthContext';
import { PlusCircle, Ticket, RefreshCw, AlertCircle, Clock, CheckCircle, XCircle, Paperclip, Search, Inbox, ArrowUpRight } from 'lucide-react';

const CARD = { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' };

const STATUS_META = {
  OPEN:        { icon: AlertCircle, color: '#2563EB', bg: '#EFF6FF', accent: '#2563EB', label: 'Open'        },
  IN_PROGRESS: { icon: Clock,       color: '#D97706', bg: '#FFFBEB', accent: '#F59E0B', label: 'In Progress' },
  RESOLVED:    { icon: CheckCircle, color: '#16A34A', bg: '#F0FDF4', accent: '#16A34A', label: 'Resolved'    },
  CLOSED:      { icon: XCircle,     color: '#64748B', bg: '#F8FAFC', accent: '#94A3B8', label: 'Closed'      },
};

export default function UserDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets]   = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch]     = useState('');
  const [spinning, setSpinning] = useState(false);

  const fetchTickets = async () => {
    setLoading(true); setSpinning(true);
    try {
      const p = new URLSearchParams({ limit: 50 });
      if (statusFilter) p.append('status', statusFilter);
      const res = await api.get(`/tickets/my?${p}`);
      setTickets(res.data.tickets); setTotal(res.data.total);
    } finally { setLoading(false); setTimeout(() => setSpinning(false), 400); }
  };

  useEffect(() => { fetchTickets(); }, [statusFilter]);

  const counts = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, CLOSED: 0 };
  tickets.forEach((t) => { if (counts[t.status] !== undefined) counts[t.status]++; });
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  const filtered = tickets.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.title?.toLowerCase().includes(q) ||
      t.ticketId?.toLowerCase().includes(q) ||
      t.problemCategory?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q)
    );
  });

  return (
    <Layout>
      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>Welcome back, {firstName}</h1>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>
            {total > 0 ? `You have ${total} support ticket${total !== 1 ? 's' : ''}` : 'No tickets yet — raise one when you need help'}
          </p>
        </div>
        <Link to="/tickets/new" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px', borderRadius: '8px', textDecoration: 'none',
          background: '#2563EB', color: '#fff', fontSize: '14px', fontWeight: 600,
          boxShadow: '0 2px 8px rgba(37,99,235,0.28)', transition: 'background 0.15s',
        }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#1D4ED8'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#2563EB'}>
          <PlusCircle style={{ width: '16px', height: '16px' }} /> New Ticket
        </Link>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '28px' }}>
        {Object.entries(counts).map(([status, count]) => {
          const meta = STATUS_META[status];
          const Icon = meta.icon;
          const active = statusFilter === status;
          return (
            <button key={status} onClick={() => setStatusFilter(active ? '' : status)}
              style={{
                ...CARD, padding: '20px 24px', textAlign: 'left', cursor: 'pointer', border: 'none',
                borderTop: `3px solid ${active ? meta.accent : '#E2E8F0'}`,
                background: active ? '#FAFCFF' : '#FFFFFF',
                outline: active ? `1px solid ${meta.accent}` : '1px solid #E2E8F0',
                transition: 'all 0.15s', position: 'relative', overflow: 'hidden',
              }}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = '#FAFCFF'; e.currentTarget.style.outline = '1px solid #CBD5E1'; } }}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.outline = '1px solid #E2E8F0'; } }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon style={{ width: '17px', height: '17px', color: meta.color }} />
                </div>
                {active && (
                  <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: meta.color, background: meta.bg, padding: '2px 8px', borderRadius: '999px' }}>
                    Active
                  </span>
                )}
              </div>
              <p style={{ fontSize: '30px', fontWeight: 800, color: '#0F172A', lineHeight: 1, marginBottom: '4px' }}>{count}</p>
              <p style={{ fontSize: '13px', fontWeight: 500, color: '#64748B' }}>{meta.label}</p>
            </button>
          );
        })}
      </div>

      {/* ── Ticket table ── */}
      <div style={{ ...CARD, overflow: 'hidden' }}>
        {/* Table header bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #E2E8F0', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>Ticket History</h2>
            {statusFilter ? (
              <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                Showing: {statusFilter.replace('_', ' ')} ·{' '}
                <button onClick={() => setStatusFilter('')} style={{ color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '12px', fontWeight: 500 }}>
                  Clear filter
                </button>
              </p>
            ) : (
              <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{total} total · {filtered.length} shown</p>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#94A3B8' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, ID, category…"
              style={{ padding: '8px 12px 8px 32px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFFFFF', fontSize: '13px', outline: 'none', width: '240px', color: '#0F172A', fontFamily: 'inherit' }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#2563EB'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E2E8F0'} />
          </div>
          <button onClick={fetchTickets} title="Refresh"
            style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#0F172A'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#64748B'; }}>
            <RefreshCw style={{ width: '15px', height: '15px' }} className={spinning ? 'animate-spin' : ''} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '80px', textAlign: 'center' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg,#EFF6FF,#F5F3FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <Inbox style={{ width: '28px', height: '28px', color: '#2563EB' }} />
            </div>
            <p style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>No tickets yet</p>
            <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '20px', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>
              When something needs fixing, raise a ticket and our team will jump on it.
            </p>
            <Link to="/tickets/new" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '8px', background: '#2563EB', color: '#fff', fontSize: '14px', fontWeight: 600, textDecoration: 'none', boxShadow: '0 2px 8px rgba(37,99,235,0.28)' }}>
              <PlusCircle style={{ width: '15px', height: '15px' }} /> Raise your first ticket
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Search style={{ width: '22px', height: '22px', color: '#94A3B8' }} />
            </div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>No matches for “{search}”</p>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '14px' }}>Try a different search term or clear the search.</p>
            <button onClick={() => setSearch('')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer' }}>
              Clear search
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  {['Ticket ID', 'Title', 'Category', 'Priority', 'Status', 'Date', 'Files'].map((h) => (
                    <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748B', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, idx) => (
                  <tr key={t.id}
                    style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #F1F5F9' : 'none', transition: 'background 0.1s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 20px' }}>
                      <Link to={`/tickets/${t.id}`} style={{
                        display: 'inline-block', fontFamily: 'monospace', fontSize: '12px', fontWeight: 700,
                        padding: '3px 8px', borderRadius: '6px', textDecoration: 'none',
                        color: '#2563EB', background: '#EFF6FF', border: '1px solid #BFDBFE',
                      }}>
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
                      {t.problemCategory ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#1D4ED8', background: '#EFF6FF', border: '1px solid #BFDBFE', whiteSpace: 'nowrap' }}>
                          {t.problemCategory}
                        </span>
                      ) : <span style={{ color: '#CBD5E1' }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 20px' }}><PriorityBadge priority={t.priority} /></td>
                    <td style={{ padding: '14px 20px' }}><StatusBadge status={t.status} /></td>
                    <td style={{ padding: '14px 20px', color: '#94A3B8', whiteSpace: 'nowrap', fontSize: '12px' }}>
                      {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {t.attachments?.length > 0
                        ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748B' }}><Paperclip style={{ width: '13px', height: '13px' }} />{t.attachments.length}</span>
                        : <span style={{ color: '#CBD5E1' }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
