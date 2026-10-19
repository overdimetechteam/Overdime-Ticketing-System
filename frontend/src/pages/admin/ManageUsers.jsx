import { useEffect, useState } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';
import { UserPlus, Eye, EyeOff, RefreshCw, KeyRound, X, ToggleLeft, ToggleRight, Search, UserX, Trash2 } from 'lucide-react';

const CARD = { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' };

const COMPANY_APPS = {
  Dialog:          ['KYC', 'Suspense Clearence', 'SIP Trunk'],
  Biomed:          ['Preventive Maintenance', 'Corrective Maintenance', 'Consumable Requests', 'User Training', 'Contract Management', 'One Time Service'],
  Assetline:       ['Stationary', 'RMV', 'CBSL', 'IFRS9'],
  'Promise Land':  ['CRM'],
  Hemas:           ['Quarterly Distributor', 'Stock Compliance Statement Process'],
  CFLB:            ['PO/NonPO', 'Import', 'DCR'],
  Stredge:         ['Leave', 'Expense Management', 'Project Management'],
  'Lion Brewery':  ['CRM'],
};

const INPUT_BASE = {
  width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '14px',
  border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#0F172A',
  outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s', fontFamily: 'inherit',
};
const INPUT_FOCUS = { borderColor: '#2563EB', boxShadow: '0 0 0 3px rgba(37,99,235,0.1)' };

function DarkInput({ type = 'text', value, onChange, placeholder, required, minLength }) {
  const [focused, setFocused] = useState(false);
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      required={required} minLength={minLength}
      style={{ ...INPUT_BASE, ...(focused ? INPUT_FOCUS : {}) }}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
    />
  );
}

function Modal({ children, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      {children}
    </div>
  );
}

function CreateUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER', company: '', applications: [] });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusPw, setFocusPw] = useState(false);

  const availableApps = form.company ? (COMPANY_APPS[form.company] || []) : [];

  const toggleApp = (app) => {
    setForm((p) => ({
      ...p,
      applications: p.applications.includes(app)
        ? p.applications.filter((a) => a !== app)
        : [...p.applications, app],
    }));
  };

  const handleCompanyChange = (company) => {
    setForm((p) => ({ ...p, company, applications: [] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await api.post('/users', form);
      toast.success(`${res.data.name} created`);
      onCreated(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally { setLoading(false); }
  };

  return (
    <Modal onClose={onClose}>
      <div style={{ width: '100%', maxWidth: '500px', background: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(15,23,42,0.15), 0 4px 16px rgba(15,23,42,0.08)', border: '1px solid #E2E8F0', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #E2E8F0', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>Create New User</h2>
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>Add a new member to the system</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#475569'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94A3B8'; }}>
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          {/* Name + Email */}
          {[{ label: 'Full Name', key: 'name', type: 'text', ph: 'John Doe' }, { label: 'Email Address', key: 'email', type: 'email', ph: 'john@company.com' }].map(({ label, key, type, ph }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{label}</label>
              <DarkInput required type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={ph} />
            </div>
          ))}

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} required minLength={8} value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 8 characters"
                style={{ ...INPUT_BASE, paddingRight: '44px', ...(focusPw ? INPUT_FOCUS : {}) }}
                onFocus={() => setFocusPw(true)} onBlur={() => setFocusPw(false)} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '2px' }}>
                {showPw ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
              </button>
            </div>
          </div>

          {/* Role */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              style={{ ...INPUT_BASE, cursor: 'pointer' }}>
              <option value="USER">User — Standard access</option>
              <option value="ADMIN">Admin — Full access</option>
            </select>
          </div>

          {/* Company */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Company</label>
            <select value={form.company} onChange={(e) => handleCompanyChange(e.target.value)}
              style={{ ...INPUT_BASE, cursor: 'pointer', color: form.company ? '#0F172A' : '#94A3B8' }}>
              <option value="">Select company…</option>
              {Object.keys(COMPANY_APPS).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Applications */}
          {form.company && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                Applications
                <span style={{ fontSize: '11px', fontWeight: 400, color: '#94A3B8', marginLeft: '8px' }}>Select all that apply</span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {availableApps.map((app) => {
                  const checked = form.applications.includes(app);
                  return (
                    <label key={app} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${checked ? '#BFDBFE' : '#E2E8F0'}`, background: checked ? '#EFF6FF' : '#F8FAFC', cursor: 'pointer', transition: 'all 0.12s' }}>
                      <input type="checkbox" checked={checked} onChange={() => toggleApp(app)}
                        style={{ width: '15px', height: '15px', accentColor: '#2563EB', cursor: 'pointer', flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', fontWeight: checked ? 600 : 400, color: checked ? '#1D4ED8' : '#374151' }}>{app}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#475569', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.12s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F1F5F9'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#F8FAFC'}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: loading ? '#93C5FD' : '#2563EB', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 2px 8px rgba(37,99,235,0.25)', transition: 'all 0.12s' }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#1D4ED8'; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#2563EB'; }}>
              {loading ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

function ResetPasswordModal({ user, onClose }) {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.put(`/users/${user.id}/reset-password`, { newPassword: password });
      toast.success('Password reset successfully');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <Modal onClose={onClose}>
      <div style={{ width: '100%', maxWidth: '380px', background: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(15,23,42,0.15)', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #E2E8F0' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>Reset Password</h2>
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>For {user.name}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}>
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>New Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} required minLength={8} value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters"
                style={{ ...INPUT_BASE, paddingRight: '44px', ...(focused ? INPUT_FOCUS : {}) }}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '2px' }}>
                {showPw ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#475569', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: loading ? '#93C5FD' : '#2563EB', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.2)' }}>
              {loading ? 'Saving…' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default function ManageUsers() {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch]       = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try { const res = await api.get('/users'); setUsers(res.data); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/users/${deleteTarget.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      toast.success(`${deleteTarget.name} deleted`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally { setDeleting(false); }
  };

  const toggleActive = async (u) => {
    try {
      const res = await api.put(`/users/${u.id}`, { isActive: !u.isActive });
      setUsers((prev) => prev.map((x) => (x.id === u.id ? res.data : x)));
      toast.success(`${res.data.name} ${res.data.isActive ? 'activated' : 'deactivated'}`);
    } catch { toast.error('Failed to update user'); }
  };

  return (
    <Layout>
      {showCreate && (
        <CreateUserModal onClose={() => setShowCreate(false)}
          onCreated={(u) => { setUsers((p) => [u, ...p]); setShowCreate(false); }} />
      )}
      {resetTarget && <ResetPasswordModal user={resetTarget} onClose={() => setResetTarget(null)} />}

      {deleteTarget && (
        <Modal onClose={() => setDeleteTarget(null)}>
          <div style={{ width: '100%', maxWidth: '380px', background: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(15,23,42,0.15)', border: '1px solid #E2E8F0' }}>
            <div style={{ padding: '24px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Trash2 style={{ width: '20px', height: '20px', color: '#DC2626' }} />
              </div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>Delete user?</h2>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6 }}>
                <strong style={{ color: '#0F172A' }}>{deleteTarget.name}</strong> will be permanently removed. This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button onClick={() => setDeleteTarget(null)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#475569', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: deleting ? '#FCA5A5' : '#DC2626', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer', transition: 'background 0.12s' }}
                  onMouseEnter={(e) => { if (!deleting) e.currentTarget.style.background = '#B91C1C'; }}
                  onMouseLeave={(e) => { if (!deleting) e.currentTarget.style.background = '#DC2626'; }}>
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>Manage Users</h1>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>{users.length} user{users.length !== 1 ? 's' : ''} registered · {users.filter(u => u.isActive).length} active</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#94A3B8' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email…"
              style={{ padding: '9px 12px 9px 32px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFFFFF', fontSize: '13px', outline: 'none', width: '240px', color: '#0F172A', fontFamily: 'inherit' }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#2563EB'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E2E8F0'} />
          </div>
          <button onClick={fetchUsers} title="Refresh"
            style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '9px', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}>
            <RefreshCw style={{ width: '15px', height: '15px' }} />
          </button>
          <button onClick={() => setShowCreate(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#2563EB', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.28)', transition: 'background 0.12s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#1D4ED8'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#2563EB'}>
            <UserPlus style={{ width: '15px', height: '15px' }} /> Create User
          </button>
        </div>
      </div>

      {/* ── Users table ── */}
      <div style={{ ...CARD, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '80px', textAlign: 'center' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg,#EFF6FF,#F5F3FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <UserX style={{ width: '28px', height: '28px', color: '#2563EB' }} />
            </div>
            <p style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>No users yet</p>
            <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '20px' }}>Create the first user so they can sign in and raise tickets.</p>
            <button onClick={() => setShowCreate(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '8px', background: '#2563EB', color: '#fff', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.28)' }}>
              <UserPlus style={{ width: '15px', height: '15px' }} /> Create first user
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>No users match “{search}”</p>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '14px' }}>Try a different search term.</p>
            <button onClick={() => setSearch('')} style={{ fontSize: '13px', fontWeight: 600, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer' }}>Clear search</button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  {['Member', 'Email', 'Company', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748B', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, idx) => (
                  <tr key={u.id}
                    style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #F1F5F9' : 'none', transition: 'background 0.1s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#2563EB,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
                          {u.name[0].toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: '#0F172A' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#475569' }}>{u.email}</td>
                    <td style={{ padding: '14px 20px' }}>
                      {u.company ? (
                        <span style={{ fontSize: '13px', fontWeight: 500, color: '#0F172A' }}>{u.company}</span>
                      ) : <span style={{ color: '#CBD5E1', fontSize: '12px' }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, ...(u.role === 'ADMIN' ? { color: '#7C3AED', background: '#F5F3FF', border: '1px solid #DDD6FE' } : { color: '#475569', background: '#F8FAFC', border: '1px solid #E2E8F0' }) }}>
                        {u.role === 'ADMIN' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, ...(u.isActive ? { color: '#15803D', background: '#F0FDF4', border: '1px solid #BBF7D0' } : { color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA' }) }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: u.isActive ? '#16A34A' : '#DC2626', flexShrink: 0 }} />
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#94A3B8', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button onClick={() => toggleActive(u)} title={u.isActive ? 'Deactivate' : 'Activate'}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', color: u.isActive ? '#16A34A' : '#94A3B8' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#F1F5F9'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                          {u.isActive ? <ToggleRight style={{ width: '20px', height: '20px' }} /> : <ToggleLeft style={{ width: '20px', height: '20px' }} />}
                        </button>
                        <button onClick={() => setResetTarget(u)} title="Reset password"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', color: '#94A3B8' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.color = '#2563EB'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94A3B8'; }}>
                          <KeyRound style={{ width: '16px', height: '16px' }} />
                        </button>
                        <button onClick={() => setDeleteTarget(u)} title="Delete user"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', color: '#94A3B8' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94A3B8'; }}>
                          <Trash2 style={{ width: '16px', height: '16px' }} />
                        </button>
                      </div>
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
