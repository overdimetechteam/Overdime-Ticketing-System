import { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Paperclip, X, Upload, ArrowLeft, Lightbulb, ShieldCheck,
  Clock, MessageSquare, User, Calendar, Tag, Send,
} from 'lucide-react';

const CARD = { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };

const INPUT_BASE = {
  width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '14px',
  border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#0F172A',
  outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s', fontFamily: 'inherit',
  boxSizing: 'border-box',
};
const FOCUS_STYLE = { borderColor: '#2563EB', boxShadow: '0 0 0 3px rgba(37,99,235,0.1)' };


const SEVERITY_OPTIONS = [
  { value: 'CRITICAL', label: 'Critical', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', desc: 'Total outage — no workaround' },
  { value: 'HIGH',     label: 'High',     color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA', desc: 'Major function broken' },
  { value: 'MEDIUM',   label: 'Medium',   color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', desc: 'Partial loss, workaround exists' },
  { value: 'LOW',      label: 'Low',      color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', desc: 'Minor — no productivity impact' },
];

const PRIORITY_OPTIONS = [
  { value: 'URGENT', label: 'Urgent', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', desc: 'Needs immediate attention' },
  { value: 'HIGH',   label: 'High',   color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA', desc: 'Blocks your work' },
  { value: 'MEDIUM', label: 'Medium', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', desc: 'Standard issues' },
  { value: 'LOW',    label: 'Low',    color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0', desc: 'When you have time' },
];

const TIPS = [
  { icon: MessageSquare, title: 'Be specific',  body: 'Mention what you were doing, the exact error, and what you expected to happen.' },
  { icon: Clock,         title: 'Add timing',   body: 'When did it start? Does it happen every time or only sometimes?' },
  { icon: Paperclip,     title: 'Attach proof', body: 'Screenshots or short videos cut resolution time in half.' },
  { icon: ShieldCheck,   title: 'Stay safe',    body: 'Never share passwords in the description — support will never ask.' },
];

function FL({ children, required, hint }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
      <span>
        {children}
        {required && <span style={{ color: '#DC2626', marginLeft: '3px' }}>*</span>}
      </span>
      {hint && <span style={{ fontSize: '11px', fontWeight: 500, color: '#94A3B8' }}>{hint}</span>}
    </label>
  );
}

function Section({ icon: Icon, title, subtitle, children }) {
  return (
    <section style={{ padding: '22px 26px', borderBottom: '1px solid #F1F5F9' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon style={{ width: '15px', height: '15px', color: '#2563EB' }} />
        </div>
        <div>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>{title}</p>
          {subtitle && <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function RadioBtn({ value, selected, label, color, bg, desc, onClick }) {
  return (
    <button type="button" onClick={() => onClick(value)}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', textAlign: 'left', width: '100%',
        border: `1.5px solid ${selected ? color : '#E2E8F0'}`,
        background: selected ? bg : '#FFFFFF',
        transition: 'all 0.12s', fontFamily: 'inherit',
      }}>
      <div style={{
        width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
        border: `2px solid ${selected ? color : '#CBD5E1'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: selected ? color : 'transparent',
      }}>
        {selected && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: selected ? color : '#374151' }}>{label}</p>
        {desc && <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '1px' }}>{desc}</p>}
      </div>
    </button>
  );
}

function InfoPill({ icon: Icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
      <Icon style={{ width: '14px', height: '14px', color: '#64748B' }} />
      <div style={{ lineHeight: 1.2 }}>
        <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94A3B8' }}>{label}</p>
        <p style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A', marginTop: '1px' }}>{value}</p>
      </div>
    </div>
  );
}

export default function NewTicket() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileRef  = useRef();
  const [form, setForm] = useState({
    title: '', description: '', priority: 'MEDIUM', severity: '', application: '', contactNumber: '',
  });
  const [files, setFiles]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [foc, setFoc]           = useState({});
  const [dragOver, setDragOver] = useState(false);

  const setF   = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const onFoc  = (k)    => setFoc((p) => ({ ...p, [k]: true }));
  const onBlur = (k)    => setFoc((p) => ({ ...p, [k]: false }));

  const addFiles = (list) => {
    const arr = Array.from(list);
    setFiles((prev) => {
      const seen = new Set(prev.map((f) => f.name + f.size));
      return [...prev, ...arr.filter((f) => !seen.has(f.name + f.size))];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) { toast.error('Title and description are required'); return; }
    if (!form.application) { toast.error('Please select the application'); return; }
    if (!form.severity) { toast.error('Please select a severity level'); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('priority', form.priority);
      fd.append('application', form.application);
      fd.append('severity', form.severity);
      if (form.contactNumber) fd.append('contactNumber', form.contactNumber);
      files.forEach((f) => fd.append('attachments', f));
      const res = await api.post('/tickets', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(`Ticket ${res.data.ticketId} submitted`);
      navigate(`/tickets/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create ticket');
    } finally { setLoading(false); }
  };

  const fmtSize = (b) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;
  const now = useMemo(() => new Date(), []);

  return (
    <Layout>
      <button onClick={() => navigate('/dashboard')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', fontSize: '14px', marginBottom: '20px', padding: 0, fontFamily: 'inherit' }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#0F172A'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}>
        <ArrowLeft style={{ width: '16px', height: '16px' }} /> Back to tickets
      </button>

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>New Support Ticket</h1>
        <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>Describe your issue and our team will get back to you. Fields marked with * are required.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: '24px', alignItems: 'flex-start' }}>

        {/* ── Form card ── */}
        <form onSubmit={handleSubmit} style={{ ...CARD, overflow: 'hidden' }}>

          {/* Section 1 — Reporter */}
          <Section icon={User} title="Reporter" subtitle="These details are attached automatically">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <InfoPill icon={User}     label="Requestor"   value={user?.name || 'You'} />
              <InfoPill icon={Calendar} label="Date & time" value={now.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })} />
              {user?.company && <InfoPill icon={Tag} label="Company" value={user.company} />}
            </div>
          </Section>

          {/* Section 2 — Ticket details */}
          <Section icon={Tag} title="Ticket details" subtitle="Start with a clear title and description">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <FL required hint={`${form.title.length}/200`}>Title</FL>
                <input required maxLength={200} value={form.title}
                  placeholder="Brief summary of the issue"
                  onChange={(e) => setF('title', e.target.value)}
                  onFocus={() => onFoc('title')} onBlur={() => onBlur('title')}
                  style={{ ...INPUT_BASE, ...(foc.title ? FOCUS_STYLE : {}) }} />
              </div>

              <div>
                <FL required hint={`${form.description.length} chars`}>Describe the issue</FL>
                <textarea required rows={5} value={form.description}
                  placeholder="Describe the issue in detail — steps to reproduce, error messages, expected vs actual behaviour…"
                  onChange={(e) => setF('description', e.target.value)}
                  onFocus={() => onFoc('desc')} onBlur={() => onBlur('desc')}
                  style={{ ...INPUT_BASE, resize: 'vertical', lineHeight: 1.6, ...(foc.desc ? FOCUS_STYLE : {}) }} />
              </div>

              <div>
                <FL>Contact Number</FL>
                <input value={form.contactNumber} placeholder="e.g. +94 77 123 4567"
                  onChange={(e) => setF('contactNumber', e.target.value)}
                  onFocus={() => onFoc('contactNumber')} onBlur={() => onBlur('contactNumber')}
                  style={{ ...INPUT_BASE, ...(foc.contactNumber ? FOCUS_STYLE : {}) }} />
              </div>

              <div>
                <FL required>Application</FL>
                <select required value={form.application}
                  onChange={(e) => setF('application', e.target.value)}
                  onFocus={() => onFoc('app')} onBlur={() => onBlur('app')}
                  style={{ ...INPUT_BASE, cursor: 'pointer', ...(foc.app ? FOCUS_STYLE : {}), color: form.application ? '#0F172A' : '#94A3B8' }}>
                  <option value="" disabled>Select the application…</option>
                  {(user?.applications || []).map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
                {(!user?.applications?.length) && (
                  <p style={{ fontSize: '12px', color: '#F59E0B', marginTop: '6px' }}>No applications assigned — contact your administrator.</p>
                )}
              </div>
            </div>
          </Section>

          {/* Section 3 — Severity */}
          <Section icon={ShieldCheck} title="Severity" subtitle="How severely is this impacting you?">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {SEVERITY_OPTIONS.map((o) => (
                <RadioBtn key={o.value} value={o.value}
                  selected={form.severity === o.value}
                  label={o.label} desc={o.desc}
                  color={o.color} bg={o.bg}
                  onClick={(v) => setF('severity', v)} />
              ))}
            </div>
          </Section>

          {/* Section 4 — Priority */}
          <Section icon={Tag} title="Priority" subtitle="How urgently do you need this resolved?">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {PRIORITY_OPTIONS.map((o) => (
                <RadioBtn key={o.value} value={o.value}
                  selected={form.priority === o.value}
                  label={o.label} desc={o.desc}
                  color={o.color} bg={o.bg}
                  onClick={(v) => setF('priority', v)} />
              ))}
            </div>
          </Section>

          {/* Section 5 — Attachments */}
          <Section icon={Paperclip} title="Attachments" subtitle="Up to 10 files · max 10 MB each">
            <div
              onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
              style={{
                borderRadius: '10px', padding: '28px 20px', textAlign: 'center', cursor: 'pointer',
                border: `2px dashed ${dragOver ? '#2563EB' : '#E2E8F0'}`,
                background: dragOver ? '#EFF6FF' : '#F8FAFC',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { if (!dragOver) { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = '#F1F5F9'; } }}
              onMouseLeave={(e) => { if (!dragOver) { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#F8FAFC'; } }}>
              <Upload style={{ width: '24px', height: '24px', color: '#94A3B8', margin: '0 auto 8px' }} />
              <p style={{ fontSize: '14px', color: '#475569', fontWeight: 500 }}>
                Drop files here or <span style={{ color: '#2563EB' }}>browse</span>
              </p>
              <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>Images, PDF, Word, Excel, ZIP</p>
              <input ref={fileRef} type="file" multiple style={{ display: 'none' }}
                onChange={(e) => addFiles(e.target.files)}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip" />
            </div>
            {files.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
                {files.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <Paperclip style={{ width: '14px', height: '14px', color: '#94A3B8', flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: '13px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                    <span style={{ fontSize: '12px', color: '#94A3B8' }}>{fmtSize(f.size)}</span>
                    <button type="button" onClick={() => setFiles((p) => p.filter((_, idx) => idx !== i))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CBD5E1', padding: '2px', display: 'flex', alignItems: 'center' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#DC2626'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#CBD5E1'}>
                      <X style={{ width: '14px', height: '14px' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Sticky footer */}
          <div style={{ display: 'flex', gap: '10px', padding: '16px 26px', background: '#FAFCFF', borderTop: '1px solid #E2E8F0' }}>
            <button type="button" onClick={() => navigate('/dashboard')}
              style={{ flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#475569', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.12s', fontFamily: 'inherit' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#E2E8F0'; }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              style={{ flex: 2, padding: '11px', borderRadius: '8px', border: 'none', background: loading ? '#93C5FD' : '#2563EB', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 2px 8px rgba(37,99,235,0.28)', transition: 'all 0.12s', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#1D4ED8'; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#2563EB'; }}>
              {loading ? 'Submitting…' : (<><Send style={{ width: '15px', height: '15px' }} /> Submit Ticket</>)}
            </button>
          </div>
        </form>

        {/* ── Right sidebar ── */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '88px' }}>

          {/* Severity guide */}
          <div style={{ ...CARD, padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck style={{ width: '15px', height: '15px', color: '#DC2626' }} />
              </div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>Severity guide</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {SEVERITY_OPTIONS.map(({ label, color, bg, border, desc }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 10px', borderRadius: '8px', background: bg, border: `1px solid ${border}` }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color, minWidth: '52px' }}>{label}</span>
                  <span style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div style={{ ...CARD, padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lightbulb style={{ width: '15px', height: '15px', color: '#D97706' }} />
              </div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>Tips for faster help</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {TIPS.map(({ icon: Icon, title, body }) => (
                <div key={title} style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon style={{ width: '13px', height: '13px', color: '#475569' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>{title}</p>
                    <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', lineHeight: 1.5 }}>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </Layout>
  );
}
