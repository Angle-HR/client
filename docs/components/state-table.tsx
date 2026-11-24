import type { ReactNode } from 'react'

interface StateRow {
  label: string
  cells: ReactNode[]
  /** Draws a divider above this row, to separate groups such as accents. */
  divider?: boolean
}

interface StateTableProps {
  columns: readonly string[]
  rows: StateRow[]
  caption?: ReactNode
}

/**
 * The states grid used on every component page: one row per variant, one
 * column per state, each cell a real component pinned to that state.
 */
function StateTable({ columns, rows, caption }: StateTableProps) {
  return (
    <figure className="not-prose my-[20px] overflow-x-auto rounded-lg-10 bg-bg-secondary outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-medium">
      <table className="w-full min-w-[560px] border-collapse text-left">
        <thead>
          <tr className="body-l-medium text-text-primary">
            <th className="px-[16px] py-[10px] font-medium">
              <span className="sr-only">Variant</span>
            </th>
            {columns.map((column) => (
              <th key={column} className="px-[8px] py-[10px] font-medium capitalize">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.label}
              className={
                row.divider ? 'border-t-[0.5px] border-border-transparent-medium' : undefined
              }
            >
              <th
                scope="row"
                className="px-[16px] py-[8px] body-l-regular font-normal whitespace-nowrap text-text-secondary"
              >
                {row.label}
              </th>
              {row.cells.map((cell, index) => (
                <td key={columns[index]} className="px-[8px] py-[8px]">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {caption && (
        <figcaption className="border-t-[0.5px] border-border-transparent-medium px-[16px] py-[10px] body-l-regular text-text-secondary">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

export { StateTable }
export type { StateRow }
