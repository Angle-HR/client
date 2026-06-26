# OTP Cell (sub-component)

> A single-character input cell used inside OTP Input, not for direct product use.

[View in Figma →](https://www.figma.com/design/7jCMwDng7HF5g7F3tGXf0E/Open-HR?node-id=2711-39040)


---

## Overview

OTP Cell (`.Subcomponents/Input/OTP` in Figma) is the individual single-character field that makes up the [OTP Input](/doc/6de2898e-309c-4e9c-ada1-1a2535cea1e6) composite. Four cells are rendered in a row with `Spacing/gap/xs-4px` gap between them.

> **This is an internal component.** Use [OTP Input](/doc/6de2898e-309c-4e9c-ada1-1a2535cea1e6) in product code. Only reference OTP Cell directly when building custom OTP experiences that need more control over the cell layout.

**Available in:** React · Next.js · Figma (internal)


---

## Anatomy

| Part | Description |
|------|-------------|
| Container | The cell frame, `38×42px`. `border: 1px`. `border-radius: Spacing/radius/sm-8px`. `padding: Spacing/padding/lg-12px` left/right. |
| Text | The character displayed inside, centred. `14×10px` bounding box. The cursor sits here when the cell has focus. |

**Width breakdown:** `12px` left pad + `14px` character area + `12px` right pad = `38px`.


---

## Spacing tokens

| Property | Value | Token |
|----------|-------|-------|
| Padding left / right | `Spacing/padding/lg-12px` | `Spacing/padding/lg-12px` |
| Border radius | `Spacing/radius/sm-8px` | `Spacing/radius/sm-8px` |
| Cell width | `38px` | —     |
| Cell height | `42px` | —     |
| Border width | `1px` | —     |
| Character area | `14×10px` | —     |


---

## States

| State | Figma value | Trigger | Visual change |
|-------|-------------|---------|---------------|
| Placeholder | `Place-holder` | Cell is empty, not focused | Dash or blank; neutral border |
| Hover | `Hover`     | Pointer enters the cell | Border darkens slightly |
| Focus | `Focus`     | Cell has keyboard focus | Border changes to focus colour; cursor visible |
| Filled | `Filled`    | Cell contains a character | Character displayed; neutral border |
| Error | `Error`     | Composite state = error | Red border and background |
| Disabled | `Disabled`  | Cell is disabled | Reduced opacity; `pointer-events: none` |
| Success | `Sucess`    | Composite state = success | Green border and background |

> **Figma typo:** The `Success` state is spelled `"Sucess"` in Figma. The API uses the correct spelling `'success'`.


---

## Accessibility

* `**type="text"**`, Not `type="number"`. Number inputs strip leading zeros and behave unpredictably on mobile.
* `**inputmode="numeric"**`, Brings up the numeric keyboard on mobile without the number input quirks.
* `**maxLength={1}**`, Restrict the cell to one character.
* `**aria-label="Digit N"**`, Each cell must have a positional label: `aria-label="Digit 1"` through `aria-label="Digit 4"`.
* `**autocomplete="one-time-code"**`, Set on the first cell to enable SMS auto-fill.
* **Focus ring**, Must be visible and meet WCAG 2.4.7. The Focus state is defined in Figma.


---

## Animation

| Trigger | From → To | Transition | Duration | Easing |
|---------|-----------|------------|----------|--------|
| Mouse enter | `Place-holder` → `Hover` | Dissolve   | `100ms`  | Ease In |
| Mouse leave | `Hover` → `Place-holder` | Dissolve   | `100ms`  | Ease Out |
| Click   | `Hover` → `Focus` | Dissolve   | `100ms`  | Ease Out |
| Click   | `Filled` → `Focus` | Dissolve   | `100ms`  | Ease Out |
| Click (commit) | `Focus` → `Filled` | Dissolve   | `100ms`  | Ease Out |
| Mouse leave | `Focus` → `Place-holder` | Dissolve   | `100ms`  | Ease Out |

> **Disabled state:** No transition is defined into or out of `Disabled` in Figma — implement it as an instant swap.

### Implementation reference

```css
/* All field state changes are 100ms: hover-in ease-in (Dissolve), all other transitions ease-out */
.field {
  transition: border-color 100ms ease-out, background-color 100ms ease-out;
}
.field:hover {
  transition-timing-function: ease-in;
}
.field:focus-within {
  transition-timing-function: ease-out;
}
```


---

## Props / API

```ts
interface OTPCellProps {
  value?: string
  onChange?: (value: string) => void
  onFocus?: React.FocusEventHandler<HTMLInputElement>
  onBlur?: React.FocusEventHandler<HTMLInputElement>
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
  state?: 'placeholder' | 'hover' | 'focus' | 'filled' | 'error' | 'disabled' | 'success'
  position: 1 | 2 | 3 | 4
  autoComplete?: string
  disabled?: boolean
  ref?: React.Ref<HTMLInputElement>
  className?: string
}
```

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `value` | `string` | `''`    | No       | The single character in this cell. |
| `onChange` | `(value: string) => void` | —       | No       | Fires when the cell value changes. Receives the single new character (or empty string on delete). |
| `state` | `'placeholder' \| ... \| 'success'` | `'placeholder'` | No       | Visual state. Usually driven by the parent OTPInput composite. |
| `position` | `1 \| 2 \| 3 \| 4` | —       | **Yes**  | Cell position (1 = leftmost). Used to generate `aria-label="Digit N"`. |
| `autoComplete` | `string` | —       | No       | HTML `autocomplete` attribute. Set `'one-time-code'` on the first cell (`position={1}`) to enable SMS auto-fill; set `'off'` on the rest. |
| `disabled` | `boolean` | `false` | No       | Disables the cell. |
| `ref` | `React.Ref<HTMLInputElement>` | —       | No       | Forwarded to the `<input>`, required for programmatic focus management (auto-advance). |
| `className` | `string` | —       | No       | Additional CSS class. |


---

## Code examples

### Basic cell wiring (how OTPInput uses this internally)

```tsx
// Next.js (App Router), Client Component
'use client'

// This is the internal pattern, use OTPInput in product code, not this directly
const cellRefs = [
  useRef<HTMLInputElement>(null),
  useRef<HTMLInputElement>(null),
  useRef<HTMLInputElement>(null),
  useRef<HTMLInputElement>(null),
]

function handleChange(index: number, char: string) {
  const next = [...digits]
  next[index] = char.slice(-1)  // take only the last character
  setDigits(next)
  // Auto-advance
  if (char && index < 3) cellRefs[index + 1].current?.focus()
}

function handleKeyDown(index: number, e: React.KeyboardEvent) {
  // Backspace on empty cell, retreat to previous
  if (e.key === 'Backspace' && !digits[index] && index > 0) {
    cellRefs[index - 1].current?.focus()
  }
}

{[0, 1, 2, 3].map((i) => (
  <OTPCell
    key={i}
    position={(i + 1) as 1 | 2 | 3 | 4}
    value={digits[i]}
    onChange={(v) => handleChange(i, v)}
    onKeyDown={(e) => handleKeyDown(i, e)}
    ref={cellRefs[i]}
    state={errorState ? 'error' : digits[i] ? 'filled' : 'placeholder'}
    autoComplete={i === 0 ? 'one-time-code' : 'off'}
  />
))}
```

```tsx
// React
// This is the internal pattern, use OTPInput in product code, not this directly
const cellRefs = [
  useRef<HTMLInputElement>(null),
  useRef<HTMLInputElement>(null),
  useRef<HTMLInputElement>(null),
  useRef<HTMLInputElement>(null),
]

function handleChange(index: number, char: string) {
  const next = [...digits]
  next[index] = char.slice(-1)  // take only the last character
  setDigits(next)
  // Auto-advance
  if (char && index < 3) cellRefs[index + 1].current?.focus()
}

function handleKeyDown(index: number, e: React.KeyboardEvent) {
  // Backspace on empty cell, retreat to previous
  if (e.key === 'Backspace' && !digits[index] && index > 0) {
    cellRefs[index - 1].current?.focus()
  }
}

{[0, 1, 2, 3].map((i) => (
  <OTPCell
    key={i}
    position={(i + 1) as 1 | 2 | 3 | 4}
    value={digits[i]}
    onChange={(v) => handleChange(i, v)}
    onKeyDown={(e) => handleKeyDown(i, e)}
    ref={cellRefs[i]}
    state={errorState ? 'error' : digits[i] ? 'filled' : 'placeholder'}
    autoComplete={i === 0 ? 'one-time-code' : 'off'}
  />
))}
```


---

## Related components

* [OTP Input](/doc/6de2898e-309c-4e9c-ada1-1a2535cea1e6), The composite that renders four OTP Cells. Use this in product code.