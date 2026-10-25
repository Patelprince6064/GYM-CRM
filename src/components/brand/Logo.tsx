import { Dumbbell } from 'lucide-react'
import { BRAND } from '@/constants'

/**
 * Brand mark — a lime "pulse" tile with a dumbbell glyph.
 * `size` controls the tile; `subtitle` toggles the system label.
 */
export function Logo({
  size = 40,
  subtitle = true,
  markOnly = false,
}: {
  size?: number
  subtitle?: boolean
  markOnly?: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex items-center justify-center relative overflow-hidden"
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.3,
          background: 'linear-gradient(140deg, #FFFFFF, #D4D4D8)',
          boxShadow: '0 8px 24px -10px rgba(255,255,255,0.3)',
          flexShrink: 0,
        }}
        aria-hidden
      >
        <Dumbbell size={size * 0.5} color="#000000" strokeWidth={2.4} />
        <span
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.4), transparent 55%)',
            opacity: 0.35,
          }}
        />
      </div>
      {!markOnly && (
        <div className="leading-none">
          <div
            style={{
              fontSize: size * 0.4,
              fontWeight: 900,
              color: 'white',
              letterSpacing: '-0.03em',
            }}
          >
            {BRAND.name.slice(0, 3)}
            <span style={{ color: 'var(--accent-primary)' }}>{BRAND.name.slice(3)}</span>
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: Math.max(8, size * 0.2),
                color: 'var(--text-muted)',
                fontWeight: 700,
                letterSpacing: '0.16em',
                marginTop: 4,
                textTransform: 'uppercase',
              }}
            >
              {BRAND.system}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
