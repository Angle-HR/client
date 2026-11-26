// Field label, copied from Figma (Open HR): .Subcomponents/label-wrapper,
// node 5117:122194, 3 variants (Prod No / Yes × With SubText) and a Required
// boolean. Tests check label-wrapper.tsx against this.

const LABEL_FIGMA = {
  /** The label line: 9px tall (12px text trimmed to cap height), inset 3px. */
  height: 9,
  paddingLeft: 3,
  /** Between the label and the asterisk. */
  gap: 2,
  label: { style: 'Inter/Body/xS/SemiBold', utility: 'text-body-xs', weight: 'font-medium-550' },
  /** Field labels are tertiary; Prod (form questions) is primary. */
  colour: { default: 'text-tertiary', prod: 'text-primary' },
  /** Required: "*" at 9px, Semi Bold, text/Error. */
  required: { text: '*', size: 9, utility: 'text-label', colour: 'text-error' },
  /** Prod only: subtext under the title, 8px apart, 12px Regular, secondary. */
  subtext: { gap: 8, utility: 'text-body-xs', colour: 'text-secondary' },
  /** Prod only: space under the wrapper, 6px with subtext and 4px without. */
  prodPaddingBottom: { withSubtext: 6, without: 4 },
} as const

/*
 * Not in Figma, kept in code:
 * - Subtext on the default (non-Prod) label; Figma only has it on Prod.
 */

export { LABEL_FIGMA }
