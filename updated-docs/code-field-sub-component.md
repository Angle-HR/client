# Code Field (sub-component)

> The raw code editing container, used inside Input Code.

[View in Figma →](https://www.figma.com/design/7jCMwDng7HF5g7F3tGXf0E/Open-HR?node-id=997-24057)


---

## Overview

Code Field (`.Subcomponents/Input/Code` in Figma) is the inner editing container for code input. It follows the same structural pattern as [Textarea Field](/doc/de96f61e-3bf7-44c7-87f1-a03229b61a83), bordered frame, action buttons at top, text box below, but replaces the formatting toolbar with code-specific action buttons (e.g. "Format", "Copy").

**Key differences from Textarea Field:**

* No Bold/Italic/Underline toolbar. Code formatting is not prose formatting.
* Two action buttons at the top: a smaller primary button (`70px`) and a larger secondary button (`92px`).
* The text box uses monospace font.
* The text box **expands dramatically on Focus**, from `25px` collapsed to `232px` editing height.

> **Use Input Code in product code.** Only reference this sub-component when building a custom code editing composite.

**Available in:** React · Next.js · Figma (internal)


---

## Anatomy

| Part | Description |
|------|-------------|
| Container | Bordered frame. `Spacing/padding/lg-12px` all-side padding. `Spacing/radius/sm-7px` radius. `1px` border. |
| Primary action button | `70px` wide × `24px` tall. Top-right area. Typical label: "Format". |
| Secondary action button | `92px` wide × `24px` tall. Adjacent to primary. Typical label: "Copy code". |
| Text box | The `<textarea>` element. Monospace font. `25px` collapsed, `232px` when focused. `Spacing/padding/xs-4px` top padding, `Spacing/padding/lg-12px` bottom padding. |

**Field heights by state:**

| State | Container height | Text box height |
|-------|------------------|-----------------|
| Placeholder / Hover / Filled / Error / Disabled | `85px`           | `25px`          |
| Focus | `292px`          | `232px`         |


---

## Spacing tokens

| Property | Value | Token |
|----------|-------|-------|
| Container padding (all sides) | `Spacing/padding/lg-12px` | `Spacing/padding/lg-12px` |
| Border radius | `Spacing/radius/sm-7px` | `Spacing/radius/sm-7px` |
| Gap (action buttons ↔ text box) | `Spacing/gap/lg-12px` | `Spacing/gap/lg-12px` |
| Text box top padding | `Spacing/padding/xs-4px` | `Spacing/padding/xs-4px` |
| Text box bottom padding | `Spacing/padding/lg-12px` | `Spacing/padding/lg-12px` |
| Border width | `1px` | —     |
| Primary action button | `70×24px` | —     |
| Secondary action button | `92×24px` | —     |
| Text box height (collapsed) | `25px` | —     |
| Text box height (focused) | `232px` | —     |


---

## States

| State | Figma value | Visual change |
|-------|-------------|---------------|
| Placeholder | `Place holder` | Compact; placeholder text in code area; monospace font |
| Hover | `Hover`     | Border darkens |
| Focus | `Focus`     | Focus border; text box expands to `232px` |
| Selected | `Selected`  | Code text selection highlight |
| Filled | `Filled`    | Compact; code content visible |
| Error | `Error`     | Red border    |
| Disabled | `Disabled`  | Reduced opacity; non-interactive |


---

## Variants

### Toolbar visibility (`showToolbar` / Figma: `📝 Show tool bar`)

| Value | Default | Description |
|-------|---------|-------------|
| `true` | Yes     | Shows the action button row at the top |
| `false` | —       | Hides action buttons, bare text area only |

### Secondary actions (`showSecondaryActions` / Figma: `✨ show-sec_actions`)

| Value | Default | Description |
|-------|---------|-------------|
| `false` | No      | Only the primary action button is shown |
| `true` | —       | Both primary and secondary action buttons are shown |

### Swap buttons (`swapButtons` / Figma: `🔄 Swap-buttons`)

INSTANCE_SWAP prop, allows the action button to be replaced with a custom button. Control via the `primaryActionButton` prop in the API.


---

## Accessibility

* `**<textarea>**`, Native element for the code area. Add `spellCheck={false}`, `autocomplete="off"`, `autocorrect="off"`, `autocapitalize="off"`.
* `**aria-multiline="true"**`, Confirm on the textarea element.
* **Action buttons**, Each needs `aria-label`: `"Format code"`, `"Copy code to clipboard"`.
* **Keyboard**, `Tab` moves between action buttons and the text area. `Ctrl+A` selects all code in the text area.


---

## Animation

| Trigger | From → To | Transition | Duration | Easing |
|---------|-----------|------------|----------|--------|
| Mouse enter | `Place holder` → `Hover` | Dissolve   | `100ms`  | Ease In |
| Mouse leave | `Hover` → `Place holder` | Dissolve   | `100ms`  | Ease Out |
| Click   | `Hover` → `Focus` | Dissolve   | `100ms`  | Ease Out |
| Click (commit) | `Focus` → `Filled` | Smart Animate | `100ms`  | Ease Out |
| Mouse leave | `Focus` → `Place holder` | Smart Animate | `100ms`  | Ease Out |
| Drag (text select) | → `Selected` | Smart Animate | `100ms`  | Ease Out |
| Click   | `Selected` → `Focus` | Smart Animate | `100ms`  | Ease Out |

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
interface CodeFieldProps {
  state?: 'placeholder' | 'hover' | 'focus' | 'selected' | 'filled' | 'error' | 'disabled'
  value?: string
  placeholder?: string
  language?: string
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>
  onFocus?: React.FocusEventHandler<HTMLTextAreaElement>
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>
  showActionButtons?: boolean
  primaryActionButton?: React.ReactNode
  showSecondaryAction?: boolean
  secondaryActionButton?: React.ReactNode
  disabled?: boolean
  readOnly?: boolean
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean | 'true'
  ref?: React.Ref<HTMLTextAreaElement>
  className?: string
}
```

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `state` | see table above | `'placeholder'` | No       | Visual state. |
| `value` | `string` | —       | No       | Controlled value, the raw code string. |
| `placeholder` | `string` | —       | No       | Example code shown when empty. |
| `language` | `string` | `'text'` | No       | Language hint for syntax highlighting. |
| `onChange` | `React.ChangeEventHandler<HTMLTextAreaElement>` | —       | No       | Fires on every keystroke. |
| `onBlur` | `React.FocusEventHandler<HTMLTextAreaElement>` | —       | No       | Fires on blur. |
| `showActionButtons` | `boolean` | `true`  | No       | Shows the action button row. |
| `primaryActionButton` | `ReactNode` | —       | No       | The primary action Button element. |
| `showSecondaryAction` | `boolean` | `false` | No       | Shows the secondary action button. |
| `secondaryActionButton` | `ReactNode` | —       | No       | The secondary action Button element. |
| `disabled` | `boolean` | `false` | No       | Disables the field. |
| `readOnly` | `boolean` | `false` | No       | Focusable but not editable. |
| `ref` | `React.Ref<HTMLTextAreaElement>` | —       | No       | Forwarded to the `<textarea>`. |
| `className` | `string` | —       | No       | Additional CSS class on the container. |


---

## Code examples

How the parent Input Code composite wires this sub-component:

```tsx
// Next.js (App Router), Client Component
'use client'

import { useState } from 'react'
import { CodeField } from '@/components/ui/code-field'

export default function InlineCodeEditor() {
  const [code, setCode] = useState('')

  return (
    <CodeField
      value={code}
      placeholder="// Paste or write code here"
      language="javascript"
      onChange={e => setCode(e.target.value)}
      aria-label="Code snippet"
      aria-describedby="code-helper"
    />
  )
}
```

```tsx
// React
import { useState } from 'react'
import { CodeField } from './code-field'

function InlineCodeEditor() {
  const [code, setCode] = useState('')

  return (
    <CodeField
      value={code}
      placeholder="// Paste or write code here"
      language="javascript"
      onChange={e => setCode(e.target.value)}
      aria-label="Code snippet"
      aria-describedby="code-helper"
    />
  )
}
```

How Input Code uses CodeField internally:

```tsx
// Next.js (App Router), Client Component
'use client'

import { useState, useRef } from 'react'
import { CodeField } from '@/components/ui/code-field'

export function InputCode({ label, helperText, errorText, ...props }) {
  const [value, setValue] = useState('')
  const hasError = Boolean(errorText)

  return (
    <div>
      <label htmlFor="code-input">{label}</label>
      <CodeField
        id="code-input"
        value={value}
        onChange={e => setValue(e.target.value)}
        aria-invalid={hasError}
        aria-describedby={hasError ? 'code-error' : 'code-helper'}
        {...props}
      />
      <span id={hasError ? 'code-error' : 'code-helper'}>
        {hasError ? errorText : helperText}
      </span>
    </div>
  )
}
```

```tsx
// React
import { useState } from 'react'
import { CodeField } from './code-field'

function InputCode({ label, helperText, errorText, ...props }) {
  const [value, setValue] = useState('')
  const hasError = Boolean(errorText)

  return (
    <div>
      <label htmlFor="code-input">{label}</label>
      <CodeField
        id="code-input"
        value={value}
        onChange={e => setValue(e.target.value)}
        aria-invalid={hasError}
        aria-describedby={hasError ? 'code-error' : 'code-helper'}
        {...props}
      />
      <span id={hasError ? 'code-error' : 'code-helper'}>
        {hasError ? errorText : helperText}
      </span>
    </div>
  )
}
```


---

## Related components

* [Input Code](/doc/a2f266e0-8f94-4efb-be2e-cca4f8c12425), Product-facing composite. Use this in product code.
* [Textarea Field](/doc/de96f61e-3bf7-44c7-87f1-a03229b61a83), Same structural pattern with a formatting toolbar for prose.
* [Rich Text Field](/doc/132df6b7-a4a2-4d00-a69f-005a914c9fc9), Same structural pattern with a richer formatting toolbar.