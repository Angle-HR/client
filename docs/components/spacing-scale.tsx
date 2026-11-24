import tokens from '@/docs/generated/tokens.json'

const groups = tokens.spacing as { name: string; tokens: { name: string; value: string }[] }[]

/** Gap, padding and radius primitives from spacing.css, drawn to scale. */
function SpacingScale({ group }: { group: 'Gap' | 'Padding' | 'Border Radius' }) {
  const found = groups.find((g) => g.name === group)
  if (!found) throw new Error(`Spacing group "${group}" not found in spacing.css`)
  const isRadius = group === 'Border Radius'
  return (
    <div className="not-prose my-[16px] grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-[12px]">
      {found.tokens.map((token) => (
        <div
          key={token.name}
          className="flex items-center gap-[12px] rounded-lg-10 bg-bg-secondary p-[12px] outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-medium"
        >
          {isRadius ? (
            <span
              aria-hidden="true"
              className="block h-[40px] w-[40px] shrink-0 border-[1.5px] border-bg-selection-controls-selected bg-bg-transparent-blue-accent-light"
              style={{ borderRadius: `var(--${token.name})` }}
            />
          ) : (
            <span className="flex h-[40px] w-[44px] shrink-0 items-center" aria-hidden="true">
              <span
                className="block h-[16px] rounded-xs-2 bg-bg-selection-controls-selected"
                style={{ width: `max(1px, var(--${token.name}))` }}
              />
            </span>
          )}
          <span className="flex min-w-0 flex-col">
            <code className="docs-inline-code w-fit">{token.name}</code>
            <span className="body-xs-regular text-text-secondary">{token.value}</span>
          </span>
        </div>
      ))}
    </div>
  )
}

export { SpacingScale }
