# Helper Text

> Displays guidance, validation errors, or informational context below a form field.

[View in Figma →](https://www.figma.com/design/7jCMwDng7HF5g7F3tGXf0E/Open-HR?node-id=1061-48521)


---

## **Overview**

Helper Text is the sub-component that renders below every form composite in the Open HR design system, Text Input, Group Input, Textarea, and others. It carries one of three semantic states: `neutral` (guidance copy), `error` (validation failure), and `info` (supplemental context). The composite parent controls which state is active; Helper Text itself has no interactive states.

**Available in:** React · Next.js · Figma


---

## **Anatomy**

| **Part** | **Description** |
|------|-------------|
| Hint text | The single line of text. Bound to the `helper` text property in Figma. Wraps if container allows. |
| Check icon | A `check-circle` icon, visible **only in the** `**success**` **state**. Rendered before the hint text. Fill: `text/Success`. Hidden in all other states. |

**Figma layer name:** `💬 Helper-Text`


---

## **Spacing tokens**

All states share identical dimensions.

| **Property** | **Value** | **Token** |
|----------|-------|-------|
| Internal gap (icon + text) | `Spacing/gap/xs-2px` | `Spacing/gap/xs-2px` |


---

## **Variants**

### **State (**`**state**`**)**

| **Value** | **Figma value** | **Text token** | **Extra** | **When to use** |
|-------|-------------|------------|-------|-------------|
| `neutral` | `Neutral`   | `text/light` | —     | Default guidance: format hints, character limits, explanations |
| `error` | `Error`     | `text/Error` | —     | Validation failure; replaces helper text when the field is in Error state |
| `info` | `info`      | `text/Secondary` | —     | Supplemental context; use sparingly, not for validation messages |
| `success` | `succes` (Figma typo) | `text/Secondary` | `check-circle` icon, `text/Success` | Validation passes; field value is confirmed valid |

**Figma casing note:** Figma uses `Neutral` (title case), `Error` (title case), `info` (lowercase), `succes` (lowercase, missing final s). API values are normalised to lowercase with corrected spelling.


---

## **States**

Helper Text is a display sub-component — it has no interactive states (no hover, focus, or disabled). Its visual appearance is fully determined by the `state` prop passed by the parent composite.

| **State** | **Trigger** | **Text token** | **Icon** |
|-------|---------|------------|------|
| `neutral` | Default | `text/light` | None |
| `error` | Parent field enters Error state | `text/Error` | None |
| `info` | Parent explicitly passes `state="info"` | `text/Secondary` | None |
| `success` | Parent field passes validation | `text/Secondary` | `check-circle`, `text/Success` |


---

## **Design tokens**

Values read directly from Figma node `1061:48521`. All states share `font-size: 12px`, `font-weight: 400`.

| **State** | **Text token** | **Icon token** |
|-------|------------|------------|
| `neutral` | `text/light` | —          |
| `error` | `text/Error` | —          |
| `info` | `text/Secondary` | —          |
| `success` | `text/Secondary` | `text/Success` |


---

## **Usage guidelines**

**Do** use `error` state exclusively for validation failures, never for warnings or suggestions.

**Don't** use `info` for error messages. The colour difference communicates semantic meaning to sighted users and assistive technology.

**Do** keep helper text to a single short sentence. Long helper text pushes content down and makes forms harder to scan.

**Don't** repeat the label in the helper text. If the label is "Email address", don't write "Enter your email address." Write what's not obvious: "We'll only use this to send account notices."

**Do** replace helper text with error text on validation failure, don't show both simultaneously. The error message replaces the guidance copy.

**Don't** use helper text as a substitute for a visible label. Labels are always required (or `aria-label` must be provided).


---

## **Content guidelines**

* Sentence case, no trailing period for short fragments; use a period for full sentences.
* Neutral: focus on format or constraints ("e.g. +234 801 234 5678", "Max 500 characters").
* Error: be specific and actionable ("Enter a valid email address", "This field is required", "Phone number must be 10 digits").
* Info: add context that helps the user decide ("Used for payroll and tax documents only").


---

## **Behaviour in context**

Helper Text is always placed `6px` below the input field by the parent composite. The parent composite controls when and whether it is rendered via `showHelper`. When `errorText` is set on the parent, the composite switches Helper Text to `state="error"` and renders the error string. When `helperText` is set and no error exists, the composite renders `state="neutral"`.

On viewport widths where the composite wraps, Helper Text inherits the full container width.


---

## **Accessibility**

* Helper Text must be associated with its field via `aria-describedby` on the `<input>` element, the parent composite handles this automatically when `id` is supplied.
* In `error` state, the parent composite must also set `aria-invalid="true"` on the `<input>`.
* Do not render Helper Text with `role="alert"`, the parent composite owns the live region logic. Announcing every keypress would be disruptive; the error should be announced on blur.


---

## **Props / API**

`interface HelperTextProps {`

`  helper: string`

`  state?: 'neutral' | 'error' | 'info' | 'success'`

`  id?: string`

`  className?: string`

`}`

| **Prop** | **Type** | **Default** | **Required** | **Description** |
|------|------|---------|----------|-------------|
| `helper` | `string` | —       | **Yes**  | The text content to display |
| `state` | `'neutral' \| 'error' \| 'info' \| 'success'` | `'neutral'` | No       | Controls text colour and icon. `success` also renders a leading green check-circle icon. Maps to Figma `state` variant (`succes` in Figma — typo). |
| `id` | `string` | —       | No       | Element ID. Used by the parent field's `aria-describedby` to associate helper text with the input. |
| `className` | `string` | —       | No       | Additional CSS class |


---

## **Code examples**

```jsx
// Next.js (App Router), Server Component
// No 'use client' directive needed, this component carries no browser state.
// Neutral, guidance copy
<HelperText helper="We'll only use this for account notices" />
// Error, validation failure
<HelperText helper="Enter a valid email address" state="error" />
// Info, supplemental context
<HelperText helper="Used for payroll and tax documents only" state="info" />
// Success, validation confirmed (renders a green check-circle icon)
<HelperText helper="Username is available" state="success" />
// React
// Neutral, guidance copy
<HelperText helper="We'll only use this for account notices" />
// Error, validation failure
<HelperText helper="Enter a valid email address" state="error" />
// Info, supplemental context
<HelperText helper="Used for payroll and tax documents only" state="info" />
// Success, validation confirmed (renders a green check-circle icon)
<HelperText helper="Username is available" state="success" />
```

How a parent composite wires it up:

```jsx

// Next.js (App Router), Server Component
// No 'use client' directive needed, this component carries no browser state.
function TextInput({ helperText, errorText, successText, showHelper, ...props }) {
  const hasError = Boolean(errorText)
  const hasSuccess = Boolean(successText)
  const helperState = hasError ? 'error' : hasSuccess ? 'success' : 'neutral'
  const helperContent = hasError ? errorText : hasSuccess ? successText : helperText
  return (
    <div>
      <Input aria-invalid={hasError} aria-describedby="helper" {...props} />
      {showHelper && (
        <HelperText
          id="helper"
          helper={helperContent}
          state={helperState}
        />
      )}
    </div>
  )
}
// React
function TextInput({ helperText, errorText, successText, showHelper, ...props }) {
  const hasError = Boolean(errorText)
  const hasSuccess = Boolean(successText)
  const helperState = hasError ? 'error' : hasSuccess ? 'success' : 'neutral'
  const helperContent = hasError ? errorText : hasSuccess ? successText : helperText
  return (
    <div>
      <Input aria-invalid={hasError} aria-describedby="helper" {...props} />
      {showHelper && (
        <HelperText
          id="helper"
          helper={helperContent}
          state={helperState}
        />
      )}
    </div>
  )
}
```


---

## Related components

* [Text Input](/doc/93534567-2eff-45a2-b5a8-00a8b76dc4eb), uses Helper Text for field-level guidance and errors
* [Group Input](/doc/90fe0ffe-ccad-4b6b-8e0e-c38d1ec37865), uses Helper Text below the grouped field
* [Textarea](/doc/a68c7ad4-0c95-4e87-8889-09d36621449c), uses Helper Text below the multi-line field
* [OTP Input](/doc/6de2898e-309c-4e9c-ada1-1a2535cea1e6), uses Helper Text for code-entry feedback