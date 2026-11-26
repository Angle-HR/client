'use client'

// States grids for the OTP input, drawn from otp-input.figma.ts. Each cell is
// the real component with its state pinned.
import { OTPCell } from '@/components/ui/otp-input/otp-cell'
import { OTPInput } from '@/components/ui/otp-input/otp-input'
import { OTP_CELL_STATES, type OTPCellState } from '@/components/ui/otp-input/otp-input.figma'

import { StateTable } from './state-table'

const STATES = Object.keys(OTP_CELL_STATES) as OTPCellState[]
const SHOWS_DIGIT: OTPCellState[] = ['filled', 'error', 'success']

function OTPCellStates() {
  return (
    <StateTable
      columns={['empty', 'with a digit']}
      rows={STATES.map((state) => ({
        label: state,
        cells: [false, true].map((digit) => (
          <OTPCell
            key={String(digit)}
            position={1}
            state={state}
            value={digit && (SHOWS_DIGIT.includes(state) || state === 'disabled') ? '4' : ''}
            disabled={state === 'disabled'}
            readOnly
            tabIndex={-1}
          />
        )),
      }))}
      caption="Every cell state, as in Figma. Hover and focus are pinned; hover over or click the cells above to see them for real. Only an empty cell hovers."
    />
  )
}

function OTPGroupStates() {
  return (
    <StateTable
      columns={['group']}
      rows={[
        {
          label: 'rest',
          cells: [<OTPInput key="r" label="Verification Code" helperText="HelperText" />],
        },
        {
          label: 'error',
          cells: [
            <OTPInput
              key="e"
              label="Verification Code"
              defaultValue="123456"
              errorText="HelperText"
            />,
          ],
        },
        {
          label: 'success',
          cells: [
            <OTPInput
              key="s"
              label="Verification Code"
              defaultValue="123456"
              state="success"
              helperText="HelperText"
            />,
          ],
        },
      ]}
      caption="The labelled group's states. All Focused is real focus: click a cell and every cell turns blue."
    />
  )
}

export { OTPCellStates, OTPGroupStates }
