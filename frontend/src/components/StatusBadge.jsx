const CONFIG = {
  OPEN:        { label: 'Open',        dot: '#2563EB', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
  IN_PROGRESS: { label: 'In Progress', dot: '#D97706', color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
  RESOLVED:    { label: 'Resolved',    dot: '#16A34A', color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0' },
  CLOSED:      { label: 'Closed',      dot: '#94A3B8', color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0' },
};

export default function StatusBadge({ status }) {
  const c = CONFIG[status] ?? CONFIG.CLOSED;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 9px', borderRadius: '999px',
      fontSize: '12px', fontWeight: 600,
      color: c.color, background: c.bg, border: `1px solid ${c.border}`,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}
