# Rich Text Field (sub-component)

> The raw rich text editing container, used inside Rich Text Input.

[View in Figma →](https://www.figma.com/design/7jCMwDng7HF5g7F3tGXf0E/Open-HR?node-id=1023-43159)


---

## Overview

Rich Text Field (`.Subcomponents/Input/Rich-text` in Figma) is the inner editing container for rich text input. It follows the same structural pattern as [Textarea Field](/doc/de96f61e-3bf7-44c7-87f1-a03229b61a83), bordered frame, formatting toolbar, text box, optional action button, but the text box renders rich formatted content (bold, italic, lists, links) rather than plain text.

**Key differences from Textarea Field:**

* The text box contains formatted "New line" blocks, not a flat `<textarea>`.
* Intended to be backed by a rich text library (Tiptap, ProseMirror, Slate) rather than a native `<textarea>`.
* The text box **expands significantly on Focus**, from `25px` collapsed to `269px` editing height.
* The formatting toolbar has the same buttons as Textarea Field (Bold/Italic/Underline + 2 more).

> **Use Rich Text Input in product code.** Only reference this sub-component when building a custom rich text composite.

**Available in:** React · Next.js · Figma (internal)


---

## Anatomy

| Part | Description |
|------|-------------|
| Container | Bordered frame. `Spacing/padding/lg-12px` all-side padding. `Spacing/radius/sm-7px` radius. `1px` border. |
| Toolbar | Row of 5 formatting buttons, each `20×20px`, `Spacing/padding/xs-4px` padding, `12×12px` icon. `20px` total height. |
| Content area | The editable rich text region. `25px` collapsed, `269px` when focused. Contains structured "New line" blocks when expanded. |
| Action button | Optional Button. `92px` wide × `24px` tall. Top-right position. |

**Field heights by state:**

| State | Container height | Content area height |
|-------|------------------|---------------------|
| Placeholder / Hover / Filled / Error / Disabled | `81px`           | `25px`              |
| Focus | `325px`          | `269px`             |

**Toolbar buttons:**

| #   | Icon | Action |
|-----|------|--------|
| 1   | `icon/bold` | Bold   |
| 2   | `icon/italic` | Italic |
| 3   | `icon/underline` | Underline |
| 4   | Component 9 | Strikethrough or List (confirm with design) |
| 5   | Component 10 | Link or additional format (confirm with design) |

> <!-- TODO: confirm exact icons for toolbar buttons 4 and 5 -->


---

## Spacing tokens

| Property | Value | Token |
|----------|-------|-------|
| Container padding (all sides) | `Spacing/padding/lg-12px` | `Spacing/padding/lg-12px` |
| Border radius | `Spacing/radius/sm-7px` | `Spacing/radius/sm-7px` |
| Gap (toolbar ↔ content area) | `Spacing/gap/lg-12px` | `Spacing/gap/lg-12px` |
| Toolbar button padding | `Spacing/padding/xs-4px` all sides | `Spacing/padding/xs-4px` |
| Content area top padding | `Spacing/padding/xs-4px` | `Spacing/padding/xs-4px` |
| Content area bottom padding | `Spacing/padding/lg-12px` | `Spacing/padding/lg-12px` |
| Border width | `1px` | —     |
| Toolbar height | `20px` | —     |
| Toolbar button size | `20×20px` | —     |
| Toolbar button icon | `12×12px` | —     |
| Content area height (collapsed) | `25px` | —     |
| Content area height (focused) | `269px` | —     |
| Action button | `92×24px` | —     |


---

## States

| State | Figma value | Visual change |
|-------|-------------|---------------|
| Placeholder | `Place holder` | Compact; placeholder text |
| Hover | `Hover`     | Border darkens |
| Focus | `Focus`     | Focus border; content area expands to `269px` |
| Selected | `Selected`  | Rich text selection highlight |
| Filled | `Filled`    | Compact; formatted content visible |
| Error | `Error`     | Red border    |
| Disabled | `Disabled`  | Reduced opacity; non-interactive |


---

## Variants

### Toolbar visibility (`showToolbar` / Figma: `📝 Show tool bar`)

Same as Textarea Field, see that doc for details.

### Secondary actions (`showSecondaryActions` / Figma: `✨ show-sec_actions`)

Same as Textarea Field.

### Swap buttons (`swapButtons` / Figma: `🔄 Swap-buttons`)

INSTANCE_SWAP, allows the action button to be replaced. Control via `actionButton` prop.


---

## Toolbar button states

Same as Textarea Field, each button has `rest` and `Hover/Selected` states. The `Hover/Selected` state is shown when the cursor is inside text that has that format applied.


---

## Accessibility

* **Editor element**, A Tiptap/ProseMirror editor div uses `role="textbox"` with `aria-multiline="true"`. A native `<textarea>` cannot produce rich output.
* **Toolbar buttons**, `aria-label` + `aria-pressed` on each button.
* **Keyboard shortcuts**, `Ctrl+B`, `Ctrl+I`, `Ctrl+U` must work without requiring the toolbar.
* **Focus management**, After clicking a toolbar button, return focus to the editor.
* **Sanitise output**, Rich text output may contain HTML. Always sanitise before rendering or storing. See Rich Text Input docs for the security note.


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
interface RichTextFieldProps {
  state?: 'placeholder' | 'hover' | 'focus' | 'selected' | 'filled' | 'error' | 'disabled'
  value?: RichTextDocument
  placeholder?: string
  onChange?: (value: RichTextDocument) => void
  onFocus?: () => void
  onBlur?: () => void
  showToolbar?: boolean
  showActionButton?: boolean
  actionButton?: React.ReactNode
  showSecondaryActions?: boolean
  disabled?: boolean
  readOnly?: boolean
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean | 'true'
  className?: string
}

type RichTextDocument = object | string  // depends on the rich text library
```

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `state` | see table above | `'placeholder'` | No       | Visual state. |
| `value` | `RichTextDocument` | —       | No       | Controlled rich text value. |
| `placeholder` | `string` | —       | No       | Placeholder text when the editor is empty. |
| `onChange` | `(value: RichTextDocument) => void` | —       | No       | Fires when content changes. |
| `onBlur` | `() => void` | —       | No       | Fires when the editor loses focus. |
| `showToolbar` | `boolean` | `true`  | No       | Shows the formatting toolbar. |
| `showActionButton` | `boolean` | `false` | No       | Shows the action button. |
| `actionButton` | `ReactNode` | —       | No       | Button element for the action slot. |
| `showSecondaryActions` | `boolean` | `false` | No       | Shows secondary action buttons. |
| `disabled` | `boolean` | `false` | No       | Disables the editor. |
| `readOnly` | `boolean` | `false` | No       | Focusable but not editable. |
| `className` | `string` | —       | No       | Additional CSS class on the container. |


---

## Code examples

How the parent Rich Text Input composite wires this sub-component:

```tsx
// Next.js (App Router), Client Component
'use client'

import { useState } from 'react'
import { RichTextField } from '@/components/ui/rich-text-field'

export default function JobDescriptionEditor() {
  const [content, setContent] = useState(null)

  return (
    <RichTextField
      value={content}
      placeholder="Describe the role and responsibilities…"
      onChange={setContent}
      aria-label="Job description"
      aria-describedby="jd-helper"
    />
  )
}
```

```tsx
// React
import { useState } from 'react'
import { RichTextField } from './rich-text-field'

function JobDescriptionEditor() {
  const [content, setContent] = useState(null)

  return (
    <RichTextField
      value={content}
      placeholder="Describe the role and responsibilities…"
      onChange={setContent}
      aria-label="Job description"
      aria-describedby="jd-helper"
    />
  )
}
```

How Rich Text Input uses RichTextField internally (with error state and XSS sanitisation):

```tsx
// Next.js (App Router), Client Component
'use client'

import { useState } from 'react'
import DOMPurify from 'isomorphic-dompurify'
import { RichTextField } from '@/components/ui/rich-text-field'

export function RichTextInput({ label, helperText, errorText, showLabel = true, showHelper = true, onSave }) {
  const [value, setValue] = useState(null)
  const hasError = Boolean(errorText)

  const handleChange = (raw) => {
    // Always sanitise before storing or rendering rich text output
    const clean = typeof raw === 'string' ? DOMPurify.sanitize(raw) : raw
    setValue(clean)
  }

  return (
    <div>
      {showLabel && <label htmlFor="rich-text">{label}</label>}
      <RichTextField
        id="rich-text"
        value={value}
        onChange={handleChange}
        onBlur={() => { /* validate here, not onChange */ }}
        aria-invalid={hasError}
        aria-describedby={showHelper ? 'rich-text-helper' : undefined}
      />
      {showHelper && (
        <span id="rich-text-helper" role={hasError ? 'alert' : undefined}>
          {hasError ? errorText : helperText}
        </span>
      )}
    </div>
  )
}
```

```tsx
// React
import { useState } from 'react'
import DOMPurify from 'dompurify'
import { RichTextField } from './rich-text-field'

function RichTextInput({ label, helperText, errorText, showLabel = true, showHelper = true, onSave }) {
  const [value, setValue] = useState(null)
  const hasError = Boolean(errorText)

  const handleChange = (raw) => {
    // Always sanitise before storing or rendering rich text output
    const clean = typeof raw === 'string' ? DOMPurify.sanitize(raw) : raw
    setValue(clean)
  }

  return (
    <div>
      {showLabel && <label htmlFor="rich-text">{label}</label>}
      <RichTextField
        id="rich-text"
        value={value}
        onChange={handleChange}
        onBlur={() => { /* validate here, not onChange */ }}
        aria-invalid={hasError}
        aria-describedby={showHelper ? 'rich-text-helper' : undefined}
      />
      {showHelper && (
        <span id="rich-text-helper" role={hasError ? 'alert' : undefined}>
          {hasError ? errorText : helperText}
        </span>
      )}
    </div>
  )
}
```


---

## Related components

* [Rich Text Input](/doc/c988f131-ff4c-438b-bc00-edc853bbdade), Product-facing composite. Use this in product code.
* [Textarea Field](/doc/5aeaf83c-89cd-4df7-b201-6e0fada70ec6), Same pattern for plain text with basic formatting.
* [Code Field](/doc/0f8719c0-cbee-483b-a596-3d933458d6cb), Same pattern for code input with action buttons.