/**
 * Avatar — deterministic gradient tile with initials (or an image).
 *
 * Gradient tokens are resolved here instead of via dynamic Tailwind
 * class names, because Tailwind only emits utilities it can see as
 * static strings. `color` accepts:
 *   - a curated token  ("av-0" … "av-9")
 *   - a legacy pair    ("from-violet-500 to-purple-600") from old records
 *   - a hex/rgb value   (used by some activity rows)
 * Anything else falls back to a stable hash so the same record always
 * gets the same colour.
 */

/** Monochromatic white-to-silver gradients so avatars fit the luxury black & white theme */
const GRADIENTS: [string, string][] = [
  ['#FFFFFF', '#E4E4E7'],
  ['#F4F4F5', '#D4D4D8'],
  ['#E4E4E7', '#A1A1AA'],
  ['#FAFAFA', '#E4E4E7'],
  ['#F5F5F7', '#D4D4D8'],
  ['#E5E7EB', '#D1D5DB'],
]

function hashCode(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i += 1) h = (h * 31 + input.charCodeAt(i)) | 0
  return Math.abs(h)
}

/** Resolve any stored colour token to a `[from, to]` gradient pair. */
function resolveGradient(token?: string | null): [string, string] {
  if (!token) return GRADIENTS[0]
  const indexed = /^av-(\d{1,2})$/.exec(token)
  if (indexed) return GRADIENTS[Number(indexed[1]) % GRADIENTS.length]
  return GRADIENTS[hashCode(token) % GRADIENTS.length]
}

interface AvatarProps {
  name?: string
  /** Pre-computed initials; falls back to deriving them from `name`. */
  initials?: string
  src?: string
  color?: string
  size?: number
  /** Corner radius in px — defaults to a soft square. */
  radius?: number
  /** Overrides the derived font size. */
  fontSize?: number
  className?: string
  style?: React.CSSProperties
}

function initialsFrom(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
}

export function Avatar({
  name,
  initials,
  src,
  color,
  size = 38,
  radius,
  fontSize,
  className = '',
  style,
}: AvatarProps) {
  const [from, to] = resolveGradient(color)
  const label = initials ?? initialsFrom(name)
  const r = radius ?? size * 0.26

  const base: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: r,
    fontSize: fontSize ?? Math.max(10, size * 0.34),
    flexShrink: 0,
    overflow: 'hidden',
    ...style,
  }

  if (src) {
    return (
      <img
        src={src}
        alt={name ? `${name} avatar` : 'Avatar'}
        className={`avatar ${className}`}
        style={{ ...base, objectFit: 'cover' }}
        onError={(e) => {
          // Graceful fallback: hide the broken image and show the tile underneath.
          ;(e.currentTarget as HTMLImageElement).style.display = 'none'
        }}
      />
    )
  }

  return (
    <div
      className={`avatar ${className}`}
      style={{
        ...base,
        background: `linear-gradient(135deg, ${from}, ${to})`,
        color: '#000000',
        textShadow: 'none',
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.35)`,
      }}
      aria-hidden
    >
      {label}
    </div>
  )
}
