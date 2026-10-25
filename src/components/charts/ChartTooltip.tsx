type Payload = { name?: string; value?: string | number; color?: string; stroke?: string }

interface TooltipProps {
  active?: boolean
  payload?: Payload[]
  label?: string
  /** Suffix appended to the value, e.g. " kg". */
  suffix?: string
  /** Label shown above the value row when the payload has no name. */
  title?: string
}

/** Shared Recharts tooltip — one look everywhere in the product. */
export function ChartTooltip({ active, payload, label, suffix = '', title }: TooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div
      style={{
        background: '#111113',
        border: '1px solid rgba(255,255,255,0.18)',
        borderRadius: 10,
        padding: '9px 12px',
        color: '#FFFFFF',
        boxShadow: '0 16px 40px rgba(0,0,0,0.8)',
        minWidth: 96,
      }}
    >
      {(label || title) && (
        <div style={{ fontSize: '0.68rem', color: '#71717A', marginBottom: 5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {label ?? title}
        </div>
      )}
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: '0.86rem', fontWeight: 700, color: p.color || p.stroke || '#FFFFFF' }}>
          {p.name ? `${p.name}: ` : ''}
          {p.value}
          {suffix}
        </div>
      ))}
    </div>
  )
}
