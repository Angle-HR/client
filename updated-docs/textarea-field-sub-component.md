# Textarea Field (sub-component)

> The raw multi-line text editing container, used inside Textarea, and shares its structure with Code Field and Rich Text Field.

[View in Figma →](https://www.figma.com/design/7jCMwDng7HF5g7F3tGXf0E/Open-HR?node-id=946-25327)


---

## Overview

Textarea Field (`.Subcomponents/Input/Text-area` in Figma) is the inner editing container shared by multi-line input composites. It holds a formatting toolbar, the editable text region, and an optional action button, all within a single bordered, padded frame.

The same structural pattern (toolbar + text box + action button) is used by:

* **Textarea** (this sub-component), formatting toolbar for prose
* [Code Field](/doc/0f8719c0-cbee-483b-a596-3d933458d6cb), action buttons for code operations
* [Rich Text Field](/doc/132df6b7-a4a2-4d00-a69f-005a914c9fc9), formatting toolbar for rich text

> **Use Textarea in product code.** Only reference this sub-component directly when building a new composite that needs a raw multi-line editing surface.

**Available in:** React · Next.js · Figma (internal)


---

## Anatomy

| Part | Description |
|------|-------------|
| Container | The bordered frame. `Spacing/padding/lg-12px` all-side padding. `Spacing/radius/sm-7px` radius. `1px` border. Fills parent width. Height is flexible. |
| Toolbar | A row of formatting buttons. `20px` height. Each button is `20×20px` with `Spacing/padding/xs-4px` padding and a `12×12px` icon. Toggled by `showToolbar`. |
| Text box | The editable text region. `25px` minimum height, grows with content. `Spacing/padding/xs-4px` top padding, `Spacing/padding/lg-12px` bottom padding. |
| Action button | Optional Button positioned top-right of the container. `92px` wide × `24px` tall. Toggled by `showActionButton`. |

**Toolbar buttons (from Figma icon layers):**

| #   | Icon | Action |
|-----|------|--------|
| 1   | `icon/bold` | Bold   |
| 2   | `icon/italic` | Italic |
| 3   | `icon/underline` | Underline |
| 4   | `icon/bold` (Component 9) | Strikethrough (confirm with design) |
| 5   | (Component 10) | Additional format (confirm with design) |

> <!-- TODO: confirm exact icons for toolbar buttons 4 and 5 -->


---

## Spacing tokens

| Property | Value | Token |
|----------|-------|-------|
| Container padding (all sides) | `Spacing/padding/lg-12px` | `Spacing/padding/lg-12px` |
| Border radius | `Spacing/radius/sm-7px` | `Spacing/radius/sm-7px` |
| Gap (toolbar ↔ text box) | `Spacing/gap/lg-12px` | `Spacing/gap/lg-12px` |
| Toolbar button padding | `Spacing/padding/xs-4px` all sides | `Spacing/padding/xs-4px` |
| Text box top padding | `Spacing/padding/xs-4px` | `Spacing/padding/xs-4px` |
| Text box bottom padding | `Spacing/padding/lg-12px` | `Spacing/padding/lg-12px` |
| Border width | `1px` | —     |
| Toolbar height | `20px` | —     |
| Toolbar button size | `20×20px` | —     |
| Toolbar button icon | `12×12px` | —     |
| Text box min height | `25px` | —     |
| Action button width | `92px` | —     |
| Action button height | `24px` | —     |


---

## States

| State | Figma value | Visual change |
|-------|-------------|---------------|
| Placeholder | `Place holder` | Placeholder text; neutral border |
| Hover | `Hover`     | Border darkens |
| Focus | `Focus`     | Focus border; text box expands |
| Selected | `Selected`  | Text selection highlight in text box |
| Filled | `Filled`    | Content visible; neutral border |
| Error | `Error`     | Red border    |
| Disabled | `Disabled`  | Reduced opacity; non-interactive |


---

## Variants

### Toolbar visibility (`showToolbar` / Figma: `📝 Show tool bar`)

| Value | Default | Description |
|-------|---------|-------------|
| `true` | Yes     | Shows the formatting toolbar above the text box |
| `false` | —       | Hides the toolbar, plain text area only |

### Secondary actions (`showSecondaryActions` / Figma: `✨ show-sec_actions`)

| Value | Default | Description |
|-------|---------|-------------|
| `false` | No      | Standard single action button |
| `true` | —       | Shows additional action buttons alongside the primary |

### Swap buttons (`swapButtons` / Figma: `🔄 Swap-buttons`)

Figma INSTANCE_SWAP prop, allows the action button component to be replaced with a custom button variant. In the API, control via the `actionButton` prop.


---

## Toolbar button states

The individual toolbar button (node `945:25028`) has two states:

| State | Figma value | Description |
|-------|-------------|-------------|
| Rest  | `rest`      | Default, format not active at cursor position |
| Active | `Hover/Selected` | Format is active at cursor position (cursor is inside bold text, etc.) |

Each button is `20×20px` with `Spacing/padding/xs-4px` padding and a `12×12px` icon inside.


---

## Accessibility

* `**<textarea>**`, Use a native `<textarea>`. Do not use `<div contenteditable>`.
* **Toolbar buttons**, Each needs `aria-label` and `aria-pressed`: `aria-label="Bold" aria-pressed={isBold}`.
* **Keyboard shortcuts**, Support `Ctrl+B` / `Ctrl+I` / `Ctrl+U` for bold/italic/underline without requiring the toolbar.
* **Focus return**, After clicking a toolbar button, return focus to the textarea at the cursor position.
* `**aria-multiline="true"**`, Set on the text area element.


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
interface TextareaFieldProps {
  state?: 'placeholder' | 'hover' | 'focus' | 'selected' | 'filled' | 'error' | 'disabled'
  value?: string
  placeholder?: string
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>
  onFocus?: React.FocusEventHandler<HTMLTextAreaElement>
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>
  showToolbar?: boolean
  showActionButton?: boolean
  actionButton?: React.ReactNode
  showSecondaryActions?: boolean
  disabled?: boolean
  readOnly?: boolean
  rows?: number
  maxLength?: number
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean | 'true'
  'aria-required'?: boolean
  ref?: React.Ref<HTMLTextAreaElement>
  className?: string
}
```

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `state` | see table above | `'placeholder'` | No       | Visual state. Usually driven by the parent composite. |
| `value` | `string` | —       | No       | Controlled value. |
| `placeholder` | `string` | —       | No       | Placeholder text when empty. |
| `onChange` | `React.ChangeEventHandler<HTMLTextAreaElement>` | —       | No       | Fires on every keystroke. |
| `onFocus` | `React.FocusEventHandler<HTMLTextAreaElement>` | —       | No       | Fires on focus. |
| `onBlur` | `React.FocusEventHandler<HTMLTextAreaElement>` | —       | No       | Fires on blur. |
| `showToolbar` | `boolean` | `true`  | No       | Shows the formatting toolbar. |
| `showActionButton` | `boolean` | `false` | No       | Shows the action button slot. |
| `actionButton` | `ReactNode` | —       | No       | Button to render in the action slot. |
| `showSecondaryActions` | `boolean` | `false` | No       | Shows secondary action buttons. |
| `disabled` | `boolean` | `false` | No       | Disables the entire field. |
| `readOnly` | `boolean` | `false` | No       | Focusable but not editable. |
| `rows` | `number` | `4`     | No       | Minimum visible rows. |
| `ref` | `React.Ref<HTMLTextAreaElement>` | —       | No       | Forwarded to the `<textarea>` element. |
| `className` | `string` | —       | No       | Additional CSS class on the container. |


---

## Code examples

How the parent Textarea composite wires this sub-component:

```tsx
// Next.js (App Router), Client Component
'use client'

import { useState } from 'react'
import { TextareaField } from '@/components/ui/textarea-field'

export default function FeedbackForm() {
  const [value, setValue] = useState('')

  return (
    <TextareaField
      value={value}
      placeholder="Write your feedback here…"
      onChange={e => setValue(e.target.value)}
      aria-label="Feedback"
      aria-describedby="feedback-helper"
      rows={4}
    />
  )
}
```

```tsx
// React
import { useState } from 'react'
import { TextareaField } from './textarea-field'

function FeedbackForm() {
  const [value, setValue] = useState('')

  return (
    <TextareaField
      value={value}
      placeholder="Write your feedback here…"
      onChange={e => setValue(e.target.value)}
      aria-label="Feedback"
      aria-describedby="feedback-helper"
      rows={4}
    />
  )
}
```

How Textarea uses TextareaField internally (error + controlled):

```tsx
// Next.js (App Router), Client Component
'use client'

import { useState, useRef } from 'react'
import { TextareaField } from '@/components/ui/textarea-field'

export function Textarea({ label, helperText, errorText, maxLength, showLabel = true, showHelper = true, ...props }) {
  const [value, setValue] = useState('')
  const hasError = Boolean(errorText)
  const ref = useRef<HTMLTextAreaElement>(null)

  return (
    <div>
      {showLabel && <label htmlFor="textarea">{label}</label>}
      <TextareaField
        id="textarea"
        ref={ref}
        value={value}
        maxLength={maxLength}
        onChange={e => setValue(e.target.value)}
        onBlur={() => { /* validate here */ }}
        aria-invalid={hasError}
        aria-describedby={showHelper ? 'textarea-helper' : undefined}
        {...props}
      />
      {showHelper && (
        <span id="textarea-helper">
          {hasError ? errorText : helperText}
        </span>
      )}
    </div>
  )
}
```

```tsx
// React
import { useState, useRef } from 'react'
import { TextareaField } from './textarea-field'

function Textarea({ label, helperText, errorText, maxLength, showLabel = true, showHelper = true, ...props }) {
  const [value, setValue] = useState('')
  const hasError = Boolean(errorText)
  const ref = useRef<HTMLTextAreaElement>(null)

  return (
    <div>
      {showLabel && <label htmlFor="textarea">{label}</label>}
      <TextareaField
        id="textarea"
        ref={ref}
        value={value}
        maxLength={maxLength}
        onChange={e => setValue(e.target.value)}
        onBlur={() => { /* validate here */ }}
        aria-invalid={hasError}
        aria-describedby={showHelper ? 'textarea-helper' : undefined}
        {...props}
      />
      {showHelper && (
        <span id="textarea-helper">
          {hasError ? errorText : helperText}
        </span>
      )}
    </div>
  )
}
```


---

## Related components

* [Textarea](/doc/a68c7ad4-0c95-4e87-8889-09d36621449c), Product-facing composite. Use this in product code.
* [Code Field](/doc/0f8719c0-cbee-483b-a596-3d933458d6cb), Same structural pattern but with action buttons instead of a formatting toolbar.
* [Rich Text Field](/doc/132df6b7-a4a2-4d00-a69f-005a914c9fc9), Same structural pattern with a richer formatting toolbar.