# List Item Picker (sub-component)

> A selectable card-style option with an icon, title, and optional sub-text, used for prominent either/or choices such as onboarding paths.

[View in Figma →](https://www.figma.com/design/7jCMwDng7HF5g7F3tGXf0E/Open-HR?node-id=1127-43938)

**Available in:** React · Next.js · Figma (`🖱️ List Item/.Subcomponents/Picker`)


---

## Overview

Picker is a card-shaped selectable option, visually heavier than a standard list item. It pairs a `17×17px` icon with a title (and, in the vertical layout, a sub-text line) inside a bordered, rounded card. When selected, the border and content switch to brand blue.

Use it for prominent single-choice decisions where each option deserves visual weight — e.g. "Using Open HR for yourself only" vs "Using Open HR for a team" during onboarding. For standard dropdown rows, use the other List Item variants.


---

## Anatomy

| Part | Description |
|------|-------------|
| Container | Bordered, rounded card. `border: 1px`, `cornerRadius=Spacing/radius/lg-12px`, `overflow: clip`. Dimensions and padding depend on `layout` (see below). |
| Icon | `17×17px` solid icon, swappable instance. Colour follows the state (secondary at rest, blue accent when selected, light when disabled). |
| Title | `Inter/Body/xS/SemiBold` (12px, weight 550, line-height 19.2px), colour `text/Secondary`. Toggleable via `showTitle`. In the `disabled` state, the title renders in `Inter/Body/M/Regular` (13.8px) at `text/light`. |
| Sub-text | `Inter/Body/xS/Regular` (12px), width `127px`. **Vertical layout only.** Toggleable via `showSubtext`. |


---

## Spacing tokens

### Horizontal layout (icon above title, centred)

| Property | Value |
|----------|-------|
| Width    | `120px` |
| Padding top/bottom | `Spacing/padding/xl-18px` |
| Gap (icon → title) | `Spacing/gap/lg-12px` |
| Corner radius | `Spacing/radius/lg-12px` |

### Vertical layout (icon beside text block)

| Property | Value |
|----------|-------|
| Width    | `188px` |
| Padding left/right | `Spacing/padding/xl-18px` |
| Padding top/bottom | `Spacing/padding/xl-14px` |
| Gap (icon → text block) | `Spacing/gap/sm-8px` |
| Text block: gap (title → sub-text) | `Spacing/gap/lg-12px` |
| Text block: padding top/bottom | `Spacing/padding/xs-4px` |
| Corner radius | `Spacing/radius/lg-12px` |

> **Layout naming note:** Figma's `Horizontal` value stacks the icon *above* the title (a tall card), and `vertical` places the icon *beside* the text block (a wide card). The names refer to the card's aspect, not the flex direction.


---

## Variants

### Layout (`layout` / Figma: `¶ Layout`)

| Value | Figma value | Shape | Content |
|-------|-------------|-------|---------|
| `horizontal` | `Horizontal` | `120px` wide, centred column | Icon + title only |
| `vertical` | `vertical`  | `188px` wide row | Icon + title + sub-text |

### Boolean props

| Prop | Figma | Default | Description |
|------|-------|---------|-------------|
| `showTitle` | `Show Title` | `true`  | Render the title |
| `showSubtext` | `Show subtext` | `true`  | Render the sub-text (vertical layout only) |


---

## States

Figma defines five state variants. Colour tokens are read directly from the file.

| State | Background | Border | Text / icon |
|-------|------------|--------|-------------|
| `rest` | none       | `border/input/place-holder` (`#f1f1f1`) | `text/Secondary` (`#666`) |
| `Hover` | `bg/input/hover` (`#fafafa`) | `border/input/hover` (`rgba(0,0,0,0.1)`) | `text/Secondary` |
| `Selected` | `bg/input/focus` (`#fafafa`) | `border/input/focus` (`#3e63dd`) | `text/blue-accent` (`#3451b2`) |
| `Selected-Hover` | `bg/input/focus-hover` (`#f0f4ff`) | `border/input/focus` (`#3e63dd`) | `text/blue-accent` |
| `disabled` | `bg/input/disabled` (`#f1f1f1`) | `border/input/disabled` (`#f1f1f1`) | `text/light` (`#b3b3b3`) |


---

## Usage guidelines

**Do** use Picker for prominent, low-count single choices (2–4 options) where each option benefits from an icon and visual weight — onboarding paths, plan selection, mode selection.

**Don't** use Picker inside dropdowns or dense lists — use the standard List Item variants there.

**Do** use the `vertical` layout when options need a clarifying sub-text line; use `horizontal` when the title alone is self-explanatory.

**Don't** mix `horizontal` and `vertical` layouts in the same option group.

**Do** treat a group of Pickers as a radio group — exactly one selected at a time.


---

## Accessibility

* Treat a Picker group as a radio group: `role="radiogroup"` on the container, `role="radio"` + `aria-checked` on each card.
* The whole card is the click target — render as a `<button>` or apply `role="radio"` with `tabIndex` management.
* The icon is decorative: `aria-hidden="true"`. The title (plus sub-text via `aria-describedby`) carries the accessible name.
* `aria-disabled="true"` on disabled cards; keep them visible so users know the option exists.
* Keyboard: arrow keys move between options within the group; `Space` selects.


---

## Animation

| Trigger | From → To | Transition | Duration | Easing |
|---------|-----------|------------|----------|--------|
| Mouse enter | `rest` → `Hover` | Smart Animate | `100ms`  | Ease Out |
| Mouse leave | `Hover` → `rest` | Smart Animate | `100ms`  | Ease Out |
| Click (select) | `Hover` → `Selected` | Smart Animate | `100ms`  | Ease Out |
| Mouse enter (selected) | `Selected` → `Selected-Hover` | Smart Animate | `100ms`  | Ease Out |
| Mouse leave (selected) | `Selected-Hover` → `Selected` | Smart Animate | `100ms`  | Ease Out |
| Click (deselect) | `Selected-Hover` → `Hover` | Smart Animate | `100ms`  | Ease Out |

> **Disabled state:** No transition is defined into or out of `disabled` in Figma — implement it as an instant swap.

### Implementation reference

```css
/* All six transitions: Smart Animate 100ms ease-out */
.picker-card {
  transition: background-color 100ms ease-out, border-color 100ms ease-out, color 100ms ease-out;
}
```


---

## Props / API

```ts
interface ListItemPickerProps {
  title?: string
  subText?: string
  showTitle?: boolean
  showSubtext?: boolean
  layout?: 'horizontal' | 'vertical'
  state?: 'rest' | 'hover' | 'selected' | 'selected-hover' | 'disabled'
  selected?: boolean
  disabled?: boolean
  icon?: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  'aria-label'?: string
  className?: string
}
```

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `title` | `string` | `'List item'` | No       | Card title. Figma: `✏️ Title` |
| `subText` | `string` | `'Using Open HR for yourself only'` | No       | Sub-text line, vertical layout only. Figma: `✏️ Sub-text` |
| `showTitle` | `boolean` | `true`  | No       | Render the title. Figma: `Show Title` |
| `showSubtext` | `boolean` | `true`  | No       | Render the sub-text. Figma: `Show subtext` |
| `layout` | `'horizontal' \| 'vertical'` | `'horizontal'` | No       | Card shape. Figma: `¶ Layout` |
| `state` | `'rest' \| 'hover' \| 'selected' \| 'selected-hover' \| 'disabled'` | `'rest'` | No       | Visual state. Hover states are managed by the browser; set explicitly only for testing. |
| `selected` | `boolean` | `false` | No       | Convenience prop mapping to the `selected` states |
| `disabled` | `boolean` | `false` | No       | Disables the card |
| `icon` | `React.ReactNode` | —       | No       | The `17×17px` icon instance |
| `onClick` | `React.MouseEventHandler` | —       | No       | Selection callback |
| `aria-label` | `string` | —       | No       | Override accessible name when title alone is insufficient |
| `className` | `string` | —       | No       | Additional CSS class |


---

## Code examples

```tsx
// Next.js (App Router), Client Component
'use client'

// Onboarding path selection (radio-group behaviour)
const [path, setPath] = useState<'solo' | 'team' | null>(null)

<div role="radiogroup" aria-label="How will you use Open HR?">
  <ListItemPicker
    layout="vertical"
    title="Just me"
    subText="Using Open HR for yourself only"
    icon={<Icon name="user" aria-hidden />}
    selected={path === 'solo'}
    onClick={() => setPath('solo')}
  />
  <ListItemPicker
    layout="vertical"
    title="My team"
    subText="Hiring and managing with a team"
    icon={<Icon name="users" aria-hidden />}
    selected={path === 'team'}
    onClick={() => setPath('team')}
  />
</div>
```

```tsx
// React
// Compact horizontal pickers
<div role="radiogroup" aria-label="Select a plan">
  <ListItemPicker layout="horizontal" title="Starter" icon={<Icon name="bolt" aria-hidden />} selected={plan === 'starter'} onClick={() => setPlan('starter')} />
  <ListItemPicker layout="horizontal" title="Growth" icon={<Icon name="chart-bar" aria-hidden />} selected={plan === 'growth'} onClick={() => setPlan('growth')} />
  <ListItemPicker layout="horizontal" title="Enterprise" icon={<Icon name="building-office" aria-hidden />} disabled />
</div>
```


---

## Related components

* [List Item Location](./List%20Item%20Location.md), uses the same five-state selection pattern (rest / hover / selected / selected-hover / disabled)
* [List Item Default](./List%20Item%20Default.md), standard list row for dropdowns
* [Radio Button](/doc/7a2aa4bd-e1ab-46e1-85cc-95b14edaf6d4), use for plain radio choices without card styling