// The field label's variants, drawn from label-wrapper.figma.ts. Each cell is
// the real LabelWrapper.
import { LabelWrapper } from '@/components/ui/input/label-wrapper'

import { StateTable } from './state-table'

function LabelStates() {
  const rows = [
    {
      label: 'default',
      cells: [
        <LabelWrapper key="a" label="Full name" />,
        <LabelWrapper key="b" label="Full name" required />,
      ],
    },
    {
      label: 'prod',
      cells: [
        <LabelWrapper key="a" label="Your experience" prod />,
        <LabelWrapper key="b" label="Your experience" prod required />,
      ],
    },
    {
      label: 'prod + subtext',
      cells: [
        <LabelWrapper
          key="a"
          label="Your experience"
          subtext="A sentence or two (optional)"
          prod
        />,
        <LabelWrapper key="b" label="Your experience" subtext="A sentence or two" prod required />,
      ],
    },
  ]
  return (
    <StateTable
      columns={['Optional', 'Required']}
      rows={rows}
      caption="Figma's label-wrapper: the field label (tertiary) and Prod (primary, for questions in forms candidates fill in), each with and without Required."
    />
  )
}

export { LabelStates }
