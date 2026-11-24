import props from '@/docs/generated/props.json'

interface PropRow {
  name: string
  type: string
  values: string[] | null
  required: boolean
  defaultValue: string | null
  description: string
}

interface PropsTableProps {
  /** Component name as exported, e.g. "Button". */
  of: string
  /** Native element whose attributes are also accepted, e.g. "button". */
  native?: string
}

const unquote = (value: string) => value.replace(/^['"](.*)['"]$/, '$1')

/** Turns `backticks` in a prop description into inline code. */
function Description({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/).map((part, index) =>
        part.startsWith('`') && part.endsWith('`') ? (
          <code key={index} className="docs-inline-code">
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        ),
      )}
    </>
  )
}

/** Props read from the component's TypeScript types at build time. */
function PropsTable({ of, native }: PropsTableProps) {
  const rows = (props as Record<string, PropRow[]>)[of]
  if (!rows)
    throw new Error(`No props found for ${of}. Add it to the list in scripts/build-docs.mjs.`)
  return (
    <div className="not-prose my-[16px] overflow-x-auto rounded-lg-10 outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-medium">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="body-l-medium text-text-primary">
            <th className="px-[12px] py-[8px] font-medium">Prop</th>
            <th className="px-[12px] py-[8px] font-medium">Type</th>
            <th className="px-[12px] py-[8px] font-medium">Default</th>
            <th className="px-[12px] py-[8px] font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.name}
              className="border-t-[0.5px] border-border-transparent-medium align-top"
            >
              <td className="px-[12px] py-[10px] whitespace-nowrap">
                <code className="docs-inline-code">{row.name}</code>
                {row.required && (
                  <span className="ml-[6px] body-l-medium text-text-tags-red">Required</span>
                )}
              </td>
              <td className="px-[12px] py-[10px]">
                {row.values ? (
                  <span className="flex max-w-[200px] flex-wrap gap-[4px]">
                    {row.values.map((value) => (
                      <code key={value} className="docs-inline-code">
                        {unquote(value)}
                      </code>
                    ))}
                  </span>
                ) : (
                  <code className="docs-inline-code">{row.type}</code>
                )}
              </td>
              <td className="px-[12px] py-[10px]">
                {row.defaultValue ? (
                  <code className="docs-inline-code">{unquote(row.defaultValue)}</code>
                ) : (
                  <span className="text-text-tertiary">—</span>
                )}
              </td>
              <td className="min-w-[260px] px-[12px] py-[10px] body-l-regular text-text-secondary">
                <Description text={row.description} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {native && (
        <p className="border-t-[0.5px] border-border-transparent-medium px-[12px] py-[10px] body-l-regular text-text-secondary">
          Also accepts every native <code className="docs-inline-code">&lt;{native}&gt;</code>{' '}
          attribute, such as <code className="docs-inline-code">type</code>,{' '}
          <code className="docs-inline-code">disabled</code>,{' '}
          <code className="docs-inline-code">onClick</code> and{' '}
          <code className="docs-inline-code">className</code>.
        </p>
      )}
    </div>
  )
}

export { PropsTable }
