import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Shared helpers for the *-figma.test.tsx files: turn a Figma spec (token names
// per state) into the Tailwind classes the component must have.

interface StateColours {
  bg: string
  border: string
  /** Text or icon colour token. */
  fg: string
  ring?: string
  opacity?: number
}

type States = Partial<
  Record<'rest' | 'hover' | 'pressed' | 'focus' | 'disabled' | 'selected', StateColours>
>

const tokens = readFileSync(join(process.cwd(), 'styles/design-system/tokens.css'), 'utf8')

const prefix: Record<string, string> = {
  rest: '',
  hover: 'hover:',
  pressed: 'active:',
  focus: 'focus-visible:',
  disabled: 'disabled:',
}

function colour(kind: 'bg' | 'border' | 'text', token: string) {
  return token === 'transparent' ? `${kind}-transparent` : `${kind}-${token}`
}

/** Classes the component must carry for each state in the spec. */
function expectedClasses(states: States): string[] {
  const out: string[] = []
  const rest = states.rest!
  for (const [state, spec] of Object.entries(states)) {
    if (!spec || !(state in prefix)) continue
    const p = prefix[state]
    out.push(p + colour('bg', spec.bg), p + colour('border', spec.border))
    if (state === 'rest' || spec.fg !== rest.fg) out.push(p + colour('text', spec.fg))
    if (spec.ring) out.push(`${p}shadow-[0_0_0_1px_var(--${spec.ring})]`)
    if (spec.opacity) out.push(`${p}opacity-${Math.round(spec.opacity * 100)}`)
  }
  return out
}

/** Every token the spec names that isn't defined in tokens.css. */
function missingTokens(states: States): string[] {
  const names = Object.values(states).flatMap((s) => (s ? [s.bg, s.border, s.fg, s.ring] : []))
  return names.filter((n): n is string => !!n && n !== 'transparent' && !tokens.includes(`--${n}:`))
}

export { expectedClasses, missingTokens }
export type { StateColours, States }
