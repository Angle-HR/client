import tokens from '@/docs/generated/tokens.json'

const groups = tokens.primitives as { name: string; tokens: { name: string; value: string }[] }[]

/** The raw palette from primitives.css. Components never use these directly. */
function PrimitivePalette() {
  return (
    <div className="not-prose my-[16px] flex flex-col gap-[20px]">
      {groups.map((group) => (
        <section key={group.name} aria-label={group.name}>
          <h3 className="mb-[8px] body-l-semibold text-text-primary">{group.name}</h3>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-[8px]">
            {group.tokens.map((token) => (
              <div key={token.name} className="flex flex-col gap-[4px]">
                <span className="docs-checker block h-[40px] overflow-hidden rounded-sm-7 outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-medium">
                  <span
                    className="block h-full w-full"
                    style={{ background: `var(--${token.name})` }}
                  />
                </span>
                <code className="body-xs-regular break-all text-text-secondary">
                  {token.name.replace(/^color-/, '')}
                </code>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export { PrimitivePalette }
