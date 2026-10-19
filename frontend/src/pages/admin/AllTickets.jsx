import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import toast from 'react-hot-toast';
import { RefreshCw, Ticket, ChevronLeft, ChevronRight, Search, Inbox, CloudDownload } from 'lucide-react';

const CARD = { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' };

const STATUSES = ['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const LABELS   = { '': 'All', OPEN: 'Open', IN_PROGRESS: 'In Progress', RESOLVED: 'Resolved', CLOSED: 'Closed' };
const CATEGORIES = ['', 'Hardware', 'Software', 'Network', 'Other'];

const INPUT_S = {
  fontSize: '13px', borderRadius: '8px', border: '1px solid #E2E8F0',
  background: '#FFFFFF', color: '#0F172A', outline: 'none', cursor: 'pointer',
  fontFamily: 'inherit',
};

export default function AllTickets() {
  const [tickets, setTickets]   = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [updating, setUpdating] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchTickets = async () => {
    setLoading(true); setSpinning(true);
    try {
      const p = new URLSearchParams({ page, limit: 20 });
      if (statusFilter) p.append('status', statusFilter);
      const res = await api.get(`/tickets/all?${p}`);
      setTickets(res.data.tickets); setTotal(res.data.total);
    } finally { setLoading(false); setTimeout(() => setSpinning(false), 400); }
  };

  useEffect(() => { fetchTickets(); }, [statusFilter, page]);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await api.put(`/tickets/${id}/status`, { status });
      toast.success(`Status updated to ${LABELS[status]}`);
      fetchTickets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setUpdating(null); }
  };

  const syncFromWorkhub = async () => {
    setSyncing(true);
    try {
      const res = await api.post('/tickets/sync-workhub');
      const { synced, total: checked } = res.data;
      toast.success(synced > 0
        ? `Synced ${synced} ticket${synced !== 1 ? 's' : ''} from Workhub24`
        : `No status changes found (${checked} card${checked !== 1 ? 's' : ''} checked)`
      );
      if (synced > 0) fetchTickets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Workhub24 sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const totalPages = Math.ceil(total / 20);

  const filtered = tickets.filter((t) => {
    if (categoryFilter && t.problemCategory !== categoryFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.title?.toLowerCase().includes(q) ||
      t.ticketId?.toLowerCase().includes(q) ||
      t.user?.name?.toLowerCase().includes(q) ||
      t.problemCategory?.toLowerCase().includes(q)
    );
  });

  const TAB_ACTIVE = { background: '#2563EB', color: '#fff', border: '1px solid #2563EB', fontWeight: 600 };
  const TAB_BASE   = { background: '#FFFFFF', color: '#475569', border: '1px solid #E2E8F0', fontWeight: 500 };

  return (
    <Layout>
      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>All Tickets</h1>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>{total} ticket{total !== 1 ? 's' : ''} total</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={syncFromWorkhub} disabled={syncing} title="Sync status from Workhub24"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: syncing ? 'not-allowed' : 'pointer', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#2563EB', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', opacity: syncing ? 0.65 : 1, transition: 'all 0.12s' }}
            onMouseEnter={(e) => { if (!syncing) { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.borderColor = '#BFDBFE'; } }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#E2E8F0'; }}>
            <CloudDownload style={{ width: '14px', height: '14px' }} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing…' : 'Sync from WH24'}
          </button>
          <button onClick={fetchTickets} title="Refresh"
            style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '9px', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#0F172A'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.color = '#64748B'; }}>
            <RefreshCw style={{ width: '15px', height: '15px' }} className={spinning ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Status filter tabs ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            style={{
              padding: '7px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
              transition: 'all 0.12s', ...(statusFilter === s ? TAB_ACTIVE : TAB_BASE),
            }}
            onMouseEnter={(e) => { if (statusFilter !== s) { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#CBD5E1'; } }}
            onMouseLeave={(e) => { if (statusFilter !== s) { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#E2E8F0'; } }}>
            {LABELS[s]}
          </button>
        ))}
      </div>

      {/* ── Toolbar (search + category) ── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px', maxWidth: '360px' }}>
          <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#94A3B8' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, ID, requestor…"
            style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFFFFF', fontSize: '13px', outline: 'none', color: '#0F172A', fontFamily: 'inherit' }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#2563EB'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#E2E8F0'} />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFFFFF', fontSize: '13px', color: '#0F172A', cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c ? c : 'All categories'}</option>)}
        </select>
        <p style={{ fontSize: '13px', color: '#64748B', marginLeft: 'auto' }}>Showing {filtered.length} of {total}</p>
      </div>

      {/* ── Table card ── */}
      <div style={{ ...CARD, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '80px', textAlign: 'center' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: '80px 24px', textAlign: 'center' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Ticket style={{ width: '24px', height: '24px', color: '#94A3B8' }} />
            </div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>No tickets found</p>
            <p style={{ fontSize: '13px', color: '#64748B' }}>
              {statusFilter ? `No ${LABELS[statusFilter]?.toLowerCase()} tickets` : 'No tickets submitted yet'}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Search style={{ width: '22px', height: '22px', color: '#94A3B8' }} />
            </div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>No tickets match the filters</p>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '14px' }}>Try adjusting the search or category.</p>
            <button onClick={() => { setSearch(''); setCategoryFilter(''); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer' }}>
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    {['Ticket ID', 'Title', 'Submitted by', 'Category', 'Priority', 'Status', 'Date', 'Change Status'].map((h) => (
                      <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748B', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t, idx) => (
                    <tr key={t.id}
                      style={{ borderBottom: idx < tickets.length - 1 ? '1px solid #F1F5F9' : 'none', transition: 'background 0.1s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '14px 20px' }}>
                        <Link to={`/tickets/${t.id}`} style={{ display: 'inline-block', fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', textDecoration: 'none', color: '#2563EB', background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                          {t.ticketId}
                        </Link>
                      </td>
                      <td style={{ padding: '14px 20px', maxWidth: '200px' }}>
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
                      <td style={{ padding: '14px 20px' }}><PriorityBadge priority={t.priority} /></td>
                      <td style={{ padding: '14px 20px' }}><StatusBadge status={t.status} /></td>
                      <td style={{ padding: '14px 20px', color: '#94A3B8', whiteSpace: 'nowrap', fontSize: '12px' }}>
                        {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <select value={t.status} disabled={updating === t.id || t.status === 'CLOSED'}
                          onChange={(e) => updateStatus(t.id, e.target.value)}
                          style={{ ...INPUT_S, padding: '7px 10px', opacity: (updating === t.id || t.status === 'CLOSED') ? 0.45 : 1 }}>
                          <option value="OPEN">Open</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderTop: '1px solid #E2E8F0' }}>
                <p style={{ fontSize: '13px', color: '#64748B' }}>
                  Page <strong style={{ color: '#0F172A' }}>{page}</strong> of {totalPages}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[{ label: 'Previous', icon: ChevronLeft, dir: -1 }, { label: 'Next', icon: ChevronRight, dir: 1 }].map(({ label, icon: Icon, dir }) => {
                    const disabled = dir === -1 ? page === 1 : page >= totalPages;
                    return (
                      <button key={label} disabled={disabled} onClick={() => setPage(page + dir)}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, border: '1px solid #E2E8F0', background: disabled ? '#F8FAFC' : '#FFFFFF', color: disabled ? '#CBD5E1' : '#475569', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.12s' }}>
                        {dir === -1 && <Icon style={{ width: '14px', height: '14px' }} />}
                        {label}
                        {dir === 1 && <Icon style={{ width: '14px', height: '14px' }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
