import tokens from '@/docs/generated/tokens.json'

interface TextStyle {
  name: string
  classes: string[]
  size: string
  lineHeight: string
  letterSpacing: string | null
  mono: boolean
}

const styles = tokens.typography as TextStyle[]

/** Every text style from typography.css, rendered with its own class. */
function TypeScale() {
  return (
    <div className="not-prose my-[16px] flex flex-col">
      {styles.map((style) => {
        const sample = style.classes.find((c) => c.endsWith('-medium')) ?? style.classes[0]!
        return (
          <div
            key={style.name}
            className="grid gap-[8px] border-t-[0.5px] border-border-transparent-medium py-[16px] md:grid-cols-[220px_1fr] md:gap-[24px]"
          >
            <div className="flex flex-col gap-[4px]">
              <code className="docs-inline-code w-fit">{style.name}</code>
              <span className="body-xs-regular text-text-secondary">
                {style.size} / {style.lineHeight}
                {style.letterSpacing ? ` · ${style.letterSpacing}` : ''}
              </span>
              <span className="body-xs-regular text-text-tertiary">
                {style.classes.map((c) => c.replace(`${style.name}-`, '')).join(' · ')}
              </span>
            </div>
            <p className={`${sample} min-w-0 truncate text-text-primary`}>
              {style.mono ? 'EMP-0042 · £4,250.00' : 'Hire your team'}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export { TypeScale }
