import tokens from '@/docs/generated/tokens.json'

const groups = tokens.shadows as { name: string; tokens: { name: string; value: string }[] }[]

/** Shadow tokens from shadows.css on sample surfaces. */
function ShadowList() {
  return (
    <div className="not-prose my-[16px] grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-[24px] rounded-lg-10 bg-bg-primary p-[24px]">
      {groups
        .flatMap((g) => g.tokens)
        .map((token) => (
          <div key={token.name} className="flex flex-col gap-[10px]">
            <div
              className="h-[88px] rounded-lg-10 bg-bg-secondary"
              style={{ boxShadow: `var(--${token.name})` }}
              aria-hidden="true"
            />
            <code className="docs-inline-code w-fit">{token.name}</code>
            <span className="body-xs-regular break-words text-text-secondary">{token.value}</span>
          </div>
        ))}
    </div>
  )
}

export { ShadowList }
