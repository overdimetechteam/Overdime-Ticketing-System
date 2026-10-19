import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, CheckCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const FEATURES = [
  'Unique ticket IDs for every support request',
  'Real-time status tracking and updates',
  'File attachments and activity history',
];

const INPUT_BASE = {
  width: '100%', padding: '11px 14px', borderRadius: '8px', fontSize: '14px',
  border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#0F172A',
  outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
  fontFamily: 'inherit',
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusField, setFocusField] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  const focusStyle = { borderColor: '#2563EB', boxShadow: '0 0 0 3px rgba(37,99,235,0.1)' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Left Branding Panel ── */}
      <div style={{
        width: '45%', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(145deg, #1E40AF 0%, #1D4ED8 40%, #2563EB 100%)',
        display: 'flex', flexDirection: 'column',
      }} className="hidden lg:flex">
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }} />
        {/* Glow blobs */}
        <div style={{
          position: 'absolute', top: '-100px', right: '-100px',
          width: '400px', height: '400px', borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)',
          animation: 'pulse-glow 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-60px',
          width: '300px', height: '300px', borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(79,70,229,0.4) 0%, transparent 70%)',
          animation: 'pulse-glow 10s ease-in-out infinite 2s',
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', padding: '56px' }}>
          {/* Logo + headline */}
          <div>
            <div style={{ marginBottom: '64px' }}>
              <img src="/logo.png" alt="Overdime" style={{ height: '100px', width: 'auto', objectFit: 'contain' }} />
            </div>

            <h1 style={{ fontSize: '44px', fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: '20px' }}>
              Support,<br />simplified.
            </h1>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, maxWidth: '320px' }}>
              Raise issues, track progress, and get them resolved — all in one clean, organised platform.
            </p>
          </div>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {FEATURES.map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CheckCircle style={{ width: '13px', height: '13px', color: '#fff' }} />
                </div>
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: '#F8FAFC' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* Mobile brand */}
          <div style={{ marginBottom: '40px' }} className="lg:hidden">
            <p style={{ fontWeight: 700, fontSize: '18px', color: '#0F172A' }}>Overdime HelpDesk</p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '6px' }}>Welcome back</h2>
            <p style={{ fontSize: '14px', color: '#64748B' }}>Sign in to your account to continue</p>
          </div>

          {/* Form card */}
          <div style={{
            background: '#FFFFFF', borderRadius: '16px', padding: '32px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)',
          }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Email address
                </label>
                <input
                  type="email" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@company.com"
                  style={{ ...INPUT_BASE, ...(focusField === 'email' ? focusStyle : {}) }}
                  onFocus={() => setFocusField('email')}
                  onBlur={() => setFocusField('')}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'} required value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    style={{ ...INPUT_BASE, paddingRight: '44px', ...(focusField === 'password' ? focusStyle : {}) }}
                    onFocus={() => setFocusField('password')}
                    onBlur={() => setFocusField('')}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '2px',
                    }}>
                    {showPw ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '12px', borderRadius: '8px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  background: loading ? '#93C5FD' : '#2563EB', color: '#fff',
                  fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: loading ? 'none' : '0 2px 8px rgba(37,99,235,0.3)',
                  transition: 'all 0.15s', marginTop: '4px',
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#1D4ED8'; }}
                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#2563EB'; }}>
                {loading ? (
                  <>
                    <svg style={{ animation: 'spin 1s linear infinite', width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Signing in…
                  </>
                ) : <>Sign in <ArrowRight style={{ width: '16px', height: '16px' }} /></>}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#94A3B8', marginTop: '20px' }}>
            Need access? Contact your administrator.
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes pulse-glow { 0%, 100% { opacity: 0.7; transform: scale(1); } 50% { opacity: 1; transform: scale(1.05); } }`}</style>
    </div>
  );
}
