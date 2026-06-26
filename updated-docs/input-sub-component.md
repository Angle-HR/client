# Input (sub-component)

> The raw input field element, a low-level building block used inside Text Input and other form composites.

[View in Figma →](https://www.figma.com/design/7jCMwDng7HF5g7F3tGXf0E/Open-HR?node-id=840-39704)


---

## **Overview**

Input (`.Subcomponents/Input` in Figma) is a low-level form field element. It is **not used directly in product UI**, it is the inner field consumed by Text Input, Search, and other composites that wrap it with a label and helper text.

It supports an optional prefix icon, an optional suffix (icon or action button), and three sizes. The 40px size is available in this sub-component but is not exposed by the standard Text Input composite, it is used in other contexts (e.g. Search, standalone filter inputs).

> **Use** [Text Input](/doc/93534567-2eff-45a2-b5a8-00a8b76dc4eb)  **in product code, not this component.** Only use Input directly when building a new form composite that needs a raw field without the label/helper wrapper.

**Available in:** React · Next.js · Figma (internal)


---

## **Anatomy**

| **Part** | **Description** |
|------|-------------|
| Container | The input field frame. Fixed height per size. Fills parent width. `border: 1px`. `border-radius` varies by size. |
| Prefix icon | Optional leading icon. Size scales with the field height. Toggled by `showPrefixIcon`. |
| Text area | The actual `<input>` element. Takes all remaining space between prefix and suffix. Placeholder or user-entered value. |
| Suffix, Icon | Optional trailing icon (`💦 Icon-Suffix`). Same size as the prefix icon. Use for non-interactive metadata (e.g. a currency symbol, a unit, a lock icon). |
| Suffix, Button | Optional trailing action button (`✅ Button`). An interactive control inside the field (e.g. "Show"/"Hide" for passwords, "Clear"). |

> **Suffix icon vs suffix button:** Use the icon suffix for static visual metadata (not clickable). Use the button suffix for interactive inline actions. Never use both simultaneously, pick one suffix type per field.


---

## **Spacing tokens**

All values confirmed from Figma bounding boxes.

| **Property** | `**25px**` | `**32px**` | `**40px**` |
|----------|------|------|------|
| Gap (between elements) | `Spacing/gap/xs-4px` | `Spacing/gap/xs-4px` | `Spacing/gap/xs-4px` |
| Field height | `25px` | `32px` | `40px` |
| Padding left / right | `Spacing/padding/sm-8px` | `Spacing/padding/sm-8px` | `Spacing/padding/lg-12px` |
| Border radius | `Spacing/radius/sm-7px` | `Spacing/radius/sm-7px` | `Spacing/radius/lg-10px` |
| Border width | `1px` | `1px` | `1px` |
| Prefix icon size | `12×12px` | `14×14px` | `14×14px` |
| Suffix icon size | `12×12px` | `14×14px` | `14×14px` |

> The `40px` size uses wider padding (`Spacing/padding/lg-12px`) and a larger border radius (`Spacing/radius/lg-10px`) than the two smaller sizes. All three use the same `Spacing/gap/xs-4px` internal gap and `1px` border.


---

## **Variants**

### **Size (**`**size**` **/ Figma:** `**🏗️ Height**`**)**

| **Value** | **Figma value** | **Field height** | **Padding** | **Radius** | **When to use** |
|-------|-------------|--------------|---------|--------|-------------|
| `sm`  | `25px`      | `25px`       | `Spacing/padding/sm-8px` | `Spacing/radius/sm-7px` | Compact / dense forms |
| `md`  | `32 px`     | `32px`       | `Spacing/padding/sm-8px` | `Spacing/radius/sm-7px` | Standard forms (default via Text Input) |
| `lg`  | `40 px`     | `40px`       | `Spacing/padding/lg-12px` | `Spacing/radius/lg-10px` | Prominent inputs, search bars, primary CTAs, hero forms |

> **Figma value note:** The Figma size names use inconsistent spacing, `"25px"` (no space), `"32 px"` (space before px), `"40 px"` (space before px). The API uses `sm/md/lg`.

### **Prefix icon (**`**showPrefixIcon**` **/ Figma:** `**⬅️ Icon/Prefix**`**)**

| **Value** | **Figma default** | **Description** |
|-------|---------------|-------------|
| `true` | Yes           | Shows a leading icon inside the field |
| `false` | —             | No leading icon, text starts at the left padding |

### **Suffix (**`**suffix**` **/ Figma:** `**Suffix 👉**`**)**

| **Value** | **Figma value** | **Description** |
|-------|-------------|-------------|
| `'none'` | `Non`       | No suffix, field extends to the right padding |
| `'icon'` | `💦 Icon-Suffix` | A non-interactive trailing icon |
| `'button'` | `✅ Button`  | An interactive inline button (e.g. Show/Hide, Clear) |


---

## **States**

| **State** | **Figma value** | **Trigger** | **Visual change** |
|-------|-------------|---------|---------------|
| Placeholder | `Place-holder` | No user input | bg `bg/input/place-holder`; border `border/input/place-holder` |
| Hover | `Hover`     | Pointer enters the field | border `border/input/hover` |
| Focus | `Focus`     | Field receives keyboard focus | border `border/input/focus` |
| Filled | `Filled`    | User has entered text | border `border/input/filled`; bg unchanged |
| Error | `Error`     | Validation failure | border `border/input/error` |
| Success | `Succes` (Figma typo) | Validation passes | border `border/input/success` |
| Disabled | `Disabled`  | `disabled` prop | bg `bg/input/disabled`; border `border/input/disabled`; removed from tab order |



---

## **Design tokens**

| **State** | **Background token** | **Border token** |
|-------|------------------|--------------|
| `placeholder` | `bg/input/place-holder` | `border/input/place-holder` |
| `hover` | `bg/input/hover` | `border/input/hover` |
| `focus` | `bg/input/focus` | `border/input/focus` |
| `filled` | `bg/input/filled` | `border/input/filled` |
| `error` | `bg/input/error` | `border/input/error` |
| `success` | `bg/input/filled`  | `border/input/success` |
| `disabled` | `bg/input/disabled` | `border/input/disabled` |

All states share `border-radius: 7px` (32px / 25px height) / `10px` (40px height), and `border-width: 1px`.


---

## **Accessibility**

This sub-component renders as a plain `<input>`. All ARIA semantics (label, description, required, error) are the responsibility of the parent composite (Text Input):

* **Always pair with a visible label**, either via Text Input's label slot, or via `aria-label` / `aria-labelledby` when used standalone.
* `**aria-invalid="true"**`, Set on the `<input>` when in the Error state.
* `**aria-describedby**`, Point to the helper/error text element when present.
* `**aria-required**`, Set on the `<input>` when the field is required.
* **Focus**, Use the native `<input>` focus, no manual `tabIndex` manipulation. The Focus state is defined in Figma and must be visible.
* **Suffix button**, The suffix button must have an `aria-label` describing the action: `"Show password"` / `"Hide password"` or `"Clear field"`. It should update dynamically when the action toggles.
* **Suffix icon**, If the suffix icon conveys meaning (e.g. a lock icon indicating encryption), include a visually hidden `<span>` near the input describing it. If purely decorative, `aria-hidden="true"`.


---

## **Animation**

| **Trigger** | **From → To** | **Transition** | **Duration** | **Easing** |
|---------|-----------|------------|----------|--------|
| Mouse enter | `Place-holder` → `Hover` | Dissolve   | `100ms`  | Ease In |
| Mouse leave | `Hover` → `Place-holder` | Dissolve   | `100ms`  | Ease Out |
| Click   | `Hover` → `Focus` | Dissolve   | `100ms`  | Ease Out |
| Click   | `Filled` → `Focus` | Dissolve   | `100ms`  | Ease Out |
| Click (commit) | `Focus` → `Filled` | Dissolve   | `100ms`  | Ease Out |
| Mouse leave | `Focus` → `Place-holder` | Dissolve   | `100ms`  | Ease Out |

An additional Smart Animate `100ms` Ease In hover reaction exists on inner sub-elements (e.g. the suffix button) on some variants.

> **Disabled state:** No transition is defined into or out of `Disabled` in Figma — implement it as an instant swap.

### **Implementation reference**

```jsx
/* All field state changes are 100ms Dissolves: enter ease-in, everything else ease-out */
.input-field {
  transition: border-color 100ms ease-out, background-color 100ms ease-out;
}
.input-field:hover {
  transition-timing-function: ease-in;
}
```


---

## **Props / API**

```jsx
interface InputProps {
  size?: 'sm' | 'md' | 'lg'
  value?: string
  defaultValue?: string
  placeholder?: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  onFocus?: React.FocusEventHandler<HTMLInputElement>
  onBlur?: React.FocusEventHandler<HTMLInputElement>
  showPrefixIcon?: boolean
  prefixIcon?: React.ReactNode
  suffix?: 'none' | 'icon' | 'button'
  suffixIcon?: React.ReactNode
  suffixButton?: React.ReactNode
  state?: 'placeholder' | 'hover' | 'focus' | 'filled' | 'error' | 'success' | 'disabled'
  disabled?: boolean
  readOnly?: boolean
  type?: React.InputHTMLAttributes<HTMLInputElement>['type']
  name?: string
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean | 'true' | 'false'
  'aria-required'?: boolean
  ref?: React.Ref<HTMLInputElement>
  className?: string
}
```

| **Prop** | **Type** | **Default** | **Required** | **Description** |
|------|------|---------|----------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'`  | No       | Field height: `sm`=25px, `md`=32px, `lg`=40px. Padding and radius scale with size. |
| `value` | `string` | —       | No       | Controlled value. Use with `onChange`. Do not use with `defaultValue`. |
| `defaultValue` | `string` | —       | No       | Initial value in uncontrolled mode. |
| `placeholder` | `string` | —       | No       | Placeholder text shown when the field is empty. |
| `onChange` | `React.ChangeEventHandler<HTMLInputElement>` | —       | No       | Fires on every keystroke. |
| `onFocus` | `React.FocusEventHandler<HTMLInputElement>` | —       | No       | Fires when the field receives focus. |
| `onBlur` | `React.FocusEventHandler<HTMLInputElement>` | —       | No       | Fires when the field loses focus. Trigger validation here, not on `onChange`. |
| `showPrefixIcon` | `boolean` | `true`  | No       | Shows the leading icon slot. |
| `prefixIcon` | `ReactNode` | —       | No       | Icon component for the prefix slot. Required when `showPrefixIcon=true`. |
| `suffix` | `'none' \| 'icon' \| 'button'` | `'none'` | No       | Suffix type. `'icon'` for static metadata; `'button'` for inline actions. |
| `suffixIcon` | `ReactNode` | —       | No       | Icon for the suffix slot when `suffix='icon'`. |
| `suffixButton` | `ReactNode` | —       | No       | Button element for the suffix slot when `suffix='button'`. Must include an `aria-label`. |
| `disabled` | `boolean` | `false` | No       | Disables the field. Removes from tab order. |
| `readOnly` | `boolean` | `false` | No       | Allows focus and text selection but not editing. |
| `type` | `string` | `'text'` | No       | HTML input type. `'email'`, `'password'`, `'number'`, `'search'`, etc. |
| `name` | `string` | —       | No       | Form field name. Used for form submission. |
| `id` | `string` | —       | No       | Links to a `<label>` via `htmlFor`. Managed automatically by Text Input. |
| `aria-label` | `string` | —       | No       | Required when used without a visible label. |
| `aria-labelledby` | `string` | —       | No       | ID of an external label element. |
| `aria-describedby` | `string` | —       | No       | ID of the helper/error text element. |
| `aria-invalid` | `boolean \| 'true'` | —       | No       | Set to `true` when in the Error state. |
| `aria-required` | `boolean` | —       | No       | Indicates the field is required. |
| `ref` | `React.Ref<HTMLInputElement>` | —       | No       | Forwarded to the underlying `<input>` element. |
| `className` | `string` | —       | No       | Additional CSS class. Applied to the container frame, not the `<input>` element. |


---

## **Code examples**

### **Basic (used inside a composite)**

```jsx
// Next.js (App Router), Server Component
// No 'use client' directive needed, this component carries no browser state.
// This is what Text Input renders internally for its md size
<Input
  size="md"
  placeholder="Enter your email"
  prefixIcon={<MailIcon aria-hidden />}
  showPrefixIcon
  aria-labelledby="email-label"
  aria-describedby="email-helper"
/>
// React
// This is what Text Input renders internally for its md size
<Input
  size="md"
  placeholder="Enter your email"
  prefixIcon={<MailIcon aria-hidden />}
  showPrefixIcon
  aria-labelledby="email-label"
  aria-describedby="email-helper"
/>
```

### **Large size (search bar)**

```jsx
// Next.js (App Router), Server Component
// No 'use client' directive needed, this component carries no browser state.
<Input
  size="lg"
  type="search"
  placeholder="Search employees"
  prefixIcon={<SearchIcon aria-hidden />}
  showPrefixIcon
  aria-label="Search employees"
/>
// React
<Input
  size="lg"
  type="search"
  placeholder="Search employees"
  prefixIcon={<SearchIcon aria-hidden />}
  showPrefixIcon
  aria-label="Search employees"
/>
```

### **With suffix icon (currency)**

```jsx
// Next.js (App Router), Server Component
// No 'use client' directive needed, this component carries no browser state.
<Input
  size="md"
  placeholder="0.00"
  suffix="icon"
  suffixIcon={<span aria-hidden>£</span>}
  type="number"
  aria-label="Salary amount in GBP"
/>
// React
<Input
  size="md"
  placeholder="0.00"
  suffix="icon"
  suffixIcon={<span aria-hidden>£</span>}
  type="number"
  aria-label="Salary amount in GBP"
/>
```

### **With suffix button (show/hide password)**

```jsx
// Next.js (App Router), Client Component
'use client'
const [showPassword, setShowPassword] = useState(false)
<Input
  size="md"
  type={showPassword ? 'text' : 'password'}
  placeholder="Password"
  suffix="button"
  suffixButton={
    <button
      type="button"
      aria-label={showPassword ? 'Hide password' : 'Show password'}
      onClick={() => setShowPassword(p => !p)}
    >
      {showPassword ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
    </button>
  }
  aria-label="Password"
/>
// React
const [showPassword, setShowPassword] = useState(false)
<Input
  size="md"
  type={showPassword ? 'text' : 'password'}
  placeholder="Password"
  suffix="button"
  suffixButton={
    <button
      type="button"
      aria-label={showPassword ? 'Hide password' : 'Show password'}
      onClick={() => setShowPassword(p => !p)}
    >
      {showPassword ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
    </button>
  }
  aria-label="Password"
/>
```

### **Error state**

```jsx
// Next.js (App Router), Client Component
'use client'
<Input
  size="md"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  aria-invalid={!!emailError}
  aria-describedby={emailError ? 'email-error' : undefined}
  prefixIcon={<MailIcon aria-hidden />}
  showPrefixIcon
  aria-labelledby="email-label"
/>
{emailError && (
  <span id="email-error" role="alert">{emailError}</span>
)}
// React
<Input
  size="md"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  aria-invalid={!!emailError}
  aria-describedby={emailError ? 'email-error' : undefined}
  prefixIcon={<MailIcon aria-hidden />}
  showPrefixIcon
  aria-labelledby="email-label"
/>
{emailError && (
  <span id="email-error" role="alert">{emailError}</span>
)}
```


---

## Related components

* [Text Input](/doc/93534567-2eff-45a2-b5a8-00a8b76dc4eb), The product-facing composite that wraps Input with a label and helper text. Use this in product code.
* [Icon Button](/doc/6c30d09a-7648-4df4-87ed-846ff9820e40), Use for standalone icon actions, not as a suffix button inside a field.