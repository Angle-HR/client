import { EXAMPLES } from '@/docs/examples/registry'
import examples from '@/docs/generated/examples.json'

import { ExampleFrame } from './example-frame'

interface ExampleProps {
  /** Path under docs/examples without the extension, e.g. "button/sizes". */
  name: string
  /** Short caption under the title, if the section needs one. */
  caption?: string
}

/**
 * A live example: the real component rendered from docs/examples/<name>.tsx,
 * with a Code tab showing that same file. Because both come from one file,
 * the code can't drift from what is on screen.
 */
function Example({ name, caption }: ExampleProps) {
  const Component = EXAMPLES[name]
  const source = (examples as Record<string, { code: string; html: string }>)[name]
  if (!Component || !source) {
    throw new Error(
      `Docs example "${name}" is missing. Add docs/examples/${name}.tsx and register it.`,
    )
  }
  return (
    <ExampleFrame name={name} caption={caption} code={source.code} html={source.html}>
      <Component />
    </ExampleFrame>
  )
}

export { Example }
