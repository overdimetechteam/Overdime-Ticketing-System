import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import toast from 'react-hot-toast';
import { ArrowLeft, Paperclip, Download, CheckCircle, Clock, User, Calendar, RefreshCw, Tag, Cpu, AppWindow, Wifi, FileText, Pencil } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CARD = { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' };

const SEV = {
  CRITICAL: { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  HIGH:     { color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
  MEDIUM:   { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  LOW:      { color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
};

function MetaRow({ icon: Icon, label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <Icon style={{ width: '12px', height: '12px', color: '#94A3B8' }} />
        <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94A3B8' }}>{label}</span>
      </div>
      <div>{value}</div>
    </div>
  );
}

export default function TicketDetail() {
  const { id }   = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    api.get(`/tickets/${id}`)
      .then((r) => setTicket(r.data))
      .catch(() => toast.error('Ticket not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleClose = async () => {
    if (!confirm('Mark this ticket as closed?')) return;
    setClosing(true);
    try {
      const r = await api.post(`/tickets/${id}/close`);
      setTicket(r.data);
      toast.success('Ticket closed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to close ticket');
    } finally { setClosing(false); }
  };

  const backPath = user?.role === 'ADMIN' ? '/admin/tickets' : '/dashboard';

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </Layout>
  );

  if (!ticket) return (
    <Layout><div style={{ textAlign: 'center', padding: '120px', color: '#94A3B8' }}>Ticket not found</div></Layout>
  );

  const sev = ticket.severity ? SEV[ticket.severity] : null;

  // ── Category-specific issue details ──
  const CATEGORY_META = {
    Hardware: { icon: Cpu,      label: 'Hardware Issue',   value: ticket.hardwareIssue },
    Software: { icon: AppWindow,label: 'Software Issue',   value: ticket.softwareIssue },
    Network:  { icon: Wifi,     label: 'Network Issue',    value: ticket.networkIssue  },
    Other:    { icon: FileText, label: 'Other (Please Specify)', value: ticket.ifOtherPleaseSpecify },
  };
  const categoryMeta = ticket.problemCategory ? CATEGORY_META[ticket.problemCategory] : null;
  const hasCategoryDetails = ticket.problemCategory || ticket.department || ticket.remarks || categoryMeta;

  return (
    <Layout>
      {/* ── Back + title ── */}
      <button onClick={() => navigate(backPath)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', fontSize: '14px', marginBottom: '20px', padding: 0, fontFamily: 'inherit' }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#0F172A'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}>
        <ArrowLeft style={{ width: '16px', height: '16px' }} /> Back
      </button>

      {/* ── Ticket header ── */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 700, padding: '3px 9px', borderRadius: '6px', color: '#2563EB', background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            {ticket.ticketId}
          </span>
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
          {sev && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, color: sev.color, background: sev.bg, border: `1px solid ${sev.border}` }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: sev.color }} />
              {ticket.severity.charAt(0) + ticket.severity.slice(1).toLowerCase()} Severity
            </span>
          )}
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em', lineHeight: 1.3 }}>{ticket.title}</h1>
      </div>

      {/* ── 2-column layout ── */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

        {/* ── LEFT: Main content ── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Description */}
          <div style={CARD}>
            <div style={{ padding: '14px 24px', borderBottom: '1px solid #E2E8F0', background: '#FAFCFF', borderRadius: '12px 12px 0 0' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Description</p>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{ticket.description}</p>
            </div>
          </div>

          {/* Issue Details (category, sub-type, department, remarks) */}
          {hasCategoryDetails && (
            <div style={CARD}>
              <div style={{ padding: '14px 24px', borderBottom: '1px solid #E2E8F0', background: '#FAFCFF', borderRadius: '12px 12px 0 0' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Issue Details</p>
              </div>
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {ticket.problemCategory && (
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94A3B8', marginBottom: '6px' }}>Problem Category</p>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#1D4ED8', background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                      <Tag style={{ width: '12px', height: '12px' }} />
                      {ticket.problemCategory}
                    </span>
                  </div>
                )}
                {categoryMeta && categoryMeta.value && (
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94A3B8', marginBottom: '6px' }}>{categoryMeta.label}</p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                      {(() => { const Icon = categoryMeta.icon; return <Icon style={{ width: '14px', height: '14px', color: '#475569' }} />; })()}
                      <span style={{ fontSize: '13px', color: '#0F172A', fontWeight: 500 }}>{categoryMeta.value}</span>
                    </div>
                  </div>
                )}
                {ticket.department && (
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94A3B8', marginBottom: '6px' }}>Department</p>
                    <p style={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>{ticket.department}</p>
                  </div>
                )}
                {ticket.remarks && (
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94A3B8', marginBottom: '6px' }}>Remarks</p>
                    <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{ticket.remarks}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Attachments */}
          {ticket.attachments?.length > 0 && (
            <div style={CARD}>
              <div style={{ padding: '14px 24px', borderBottom: '1px solid #E2E8F0', background: '#FAFCFF', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Paperclip style={{ width: '14px', height: '14px', color: '#64748B' }} />
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Attachments ({ticket.attachments.length})</p>
              </div>
              <div style={{ padding: '16px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
                {ticket.attachments.map((att) => (
                  <a key={att.id} href={`/uploads/${att.storedAs}`} target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', textDecoration: 'none', background: '#F8FAFC', border: '1px solid #E2E8F0', transition: 'all 0.12s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.borderColor = '#BFDBFE'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; }}>
                    <Paperclip style={{ width: '14px', height: '14px', color: '#94A3B8', flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: '13px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.filename}</span>
                    <Download style={{ width: '13px', height: '13px', color: '#94A3B8', flexShrink: 0 }} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Activity */}
          {ticket.comments?.length > 0 && (
            <div style={CARD}>
              <div style={{ padding: '14px 24px', borderBottom: '1px solid #E2E8F0', background: '#FAFCFF', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock style={{ width: '14px', height: '14px', color: '#64748B' }} />
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Activity</p>
              </div>
              <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {ticket.comments.map((c) => (
                  <div key={c.id} style={{ padding: '14px 16px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'linear-gradient(135deg,#2563EB,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>
                        {c.source === 'admin' ? 'S' : '?'}
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>{c.source === 'admin' ? 'Support Team' : 'System'}</span>
                      <span style={{ fontSize: '12px', color: '#94A3B8' }}>·</span>
                      <span style={{ fontSize: '12px', color: '#94A3B8' }}>{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>{c.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Metadata sidebar ── */}
        <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Actions */}
          {ticket.status === 'RESOLVED' && user?.role === 'USER' && (
            <div style={{ ...CARD, padding: '16px' }}>
              <button onClick={handleClose} disabled={closing}
                style={{ width: '100%', padding: '11px', borderRadius: '8px', border: 'none', background: closing ? '#6EE7B7' : '#16A34A', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: closing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(22,163,74,0.25)', transition: 'background 0.12s', fontFamily: 'inherit' }}
                onMouseEnter={(e) => { if (!closing) e.currentTarget.style.background = '#15803D'; }}
                onMouseLeave={(e) => { if (!closing) e.currentTarget.style.background = '#16A34A'; }}>
                <CheckCircle style={{ width: '16px', height: '16px' }} />
                {closing ? 'Closing…' : 'Mark as Closed'}
              </button>
              <p style={{ fontSize: '12px', color: '#64748B', marginTop: '8px', textAlign: 'center' }}>
                Confirm this issue has been resolved
              </p>
            </div>
          )}

          {/* Details */}
          <div style={CARD}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #E2E8F0', background: '#FAFCFF', borderRadius: '12px 12px 0 0' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Ticket Details</p>
            </div>
            <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <MetaRow icon={User} label="Submitted by" value={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg,#2563EB,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                    {ticket.user?.name?.[0]?.toUpperCase()}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>{ticket.user?.name}</span>
                </div>
              } />

              {ticket.affectedSystem && (
                <MetaRow icon={Tag} label="Affected System" value={
                  <span style={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>{ticket.affectedSystem}</span>
                } />
              )}

              <MetaRow icon={Calendar} label="Created" value={
                <span style={{ fontSize: '13px', color: '#475569' }}>{new Date(ticket.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              } />

              <MetaRow icon={RefreshCw} label="Last Updated" value={
                <span style={{ fontSize: '13px', color: '#475569' }}>{new Date(ticket.updatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              } />

              {/* Divider */}
              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94A3B8', marginBottom: '6px' }}>Status</p>
                  <StatusBadge status={ticket.status} />
                </div>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94A3B8', marginBottom: '6px' }}>Priority</p>
                  <PriorityBadge priority={ticket.priority} />
                </div>
                {ticket.severity && sev && (
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94A3B8', marginBottom: '6px' }}>Severity</p>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, color: sev.color, background: sev.bg, border: `1px solid ${sev.border}` }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: sev.color }} />
                      {ticket.severity.charAt(0) + ticket.severity.slice(1).toLowerCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
