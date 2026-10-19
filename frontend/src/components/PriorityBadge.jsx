const CONFIG = {
  LOW:    { label: 'Low',    color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0' },
  MEDIUM: { label: 'Medium', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  HIGH:   { label: 'High',   color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
  URGENT: { label: 'Urgent', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
};

export default function PriorityBadge({ priority }) {
  const c = CONFIG[priority] ?? CONFIG.LOW;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 9px', borderRadius: '6px',
      fontSize: '12px', fontWeight: 600,
      color: c.color, background: c.bg, border: `1px solid ${c.border}`,
      whiteSpace: 'nowrap',
    }}>
      {c.label}
    </span>
  );
}
