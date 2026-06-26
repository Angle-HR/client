# Scrollbar (sub-component)

> The custom vertical scrollbar rendered inside scrollable list and dropdown containers, with a thumb that thickens on hover.

[View in Figma →](https://www.figma.com/design/7jCMwDng7HF5g7F3tGXf0E/Open-HR?node-id=3478-17263)

**Available in:** React · Next.js · Figma (`🖱️ List Item/.Subcomponents/scrollbar`)


---

## Overview

Scrollbar is the custom scrollbar styling used in scrollable dropdowns and list containers. It replaces the native browser scrollbar with a thin, rounded thumb that thickens and gains a track tint while the user hovers or drags it.

It is a styling sub-component — it carries no scroll logic of its own. Implement it as CSS scrollbar styling (`::-webkit-scrollbar` / `scrollbar-width`) or as the thumb element of a custom scroll container.

**This is an internal sub-component.** It is not used standalone; it belongs inside scrollable list containers.


---

## Anatomy

| Part | Description |
|------|-------------|
| Track | Vertical strip, `148px` tall in the Figma spec frame (height follows the container in practice). Padding: `Spacing/padding/xs-4px` left/right, `Spacing/padding/sm-6px` top/bottom. Transparent at rest; tinted on hover/click. |
| Thumb | Fully rounded bar (`cornerRadius=Spacing/radius/all`). `2px` wide at rest, `4px` wide on hover/click. Height is proportional to the scrollable content (`~86px` in the spec frame). |


---

## Spacing tokens

| Property | `rest` | `Hover/Click` |
|----------|------|-------------|
| Track width | `12px` | hugs content (centred) |
| Track padding left/right | `Spacing/padding/xs-4px` | `Spacing/padding/xs-4px` |
| Track padding top/bottom | `Spacing/padding/sm-6px` | `Spacing/padding/sm-6px` |
| Track background | none | `bg/transparent/light` (`rgba(0,0,0,0.04)`) |
| Thumb width | `2px` | `4px`       |
| Thumb colour | `text/input/hover` (`#b3b3b3`) | `text/light` (`#b3b3b3`) |
| Thumb corner radius | `Spacing/radius/all` (pill) | `Spacing/radius/all` (pill) |

> Both thumb colour tokens resolve to `#b3b3b3` — the visible state change is the thumb width (`2px` → `4px`) and the track tint, not the colour.


---

## States

Figma defines two state variants.

| State | Trigger | Visual |
|-------|---------|--------|
| `rest` | Default | `2px` thumb, right-aligned in the track; no track background |
| `Hover/Click` | Pointer over the scrollbar, or while dragging the thumb | `4px` thumb, centred; track tinted `bg/transparent/light` |

> Figma combines hover and active-drag into a single `Hover/Click` state — the same visual applies while hovering and while dragging.


---

## Usage guidelines

**Do** apply this styling to scrollable dropdowns, list containers, and panels that use the List Item components.

**Don't** hide the scrollbar entirely — the `2px` rest thumb is the minimum affordance that scrollable content exists.

**Do** keep the thumb height proportional to the visible/total content ratio, as native scrollbars do.

**Don't** make only the `2px` rest thumb the pointer target — the full `12px` track width is the hover/interaction zone.


---

## Accessibility

* Prefer styling the native scrollbar (CSS `::-webkit-scrollbar`, `scrollbar-width`, `scrollbar-color`) over a fully custom implementation — native scrollbars keep keyboard, screen reader, and OS-level scroll behaviour intact.
* If a custom scroll implementation is unavoidable, the container must remain keyboard-scrollable (arrow keys, Page Up/Down) and expose `aria-orientation="vertical"` on a `role="scrollbar"` element with `aria-valuenow`/`aria-valuemin`/`aria-valuemax`.
* Respect `prefers-reduced-motion` for the width transition.


---

## Animation

| Trigger | From → To | Transition | Duration | Easing |
|---------|-----------|------------|----------|--------|
| Mouse enter | `rest` → `Hover/Click` | Smart Animate | `100ms`  | Ease In |
| Mouse leave | `Hover/Click` → `rest` | Smart Animate | `50ms`   | Ease In |

The thumb width change (`2px` → `4px`) and track tint therefore animate via Smart Animate — entry slower (`100ms`) than exit (`50ms`).


---

## Implementation reference

```css
/* Native scrollbar styling matching the Figma spec */
.list-scroll-container {
  overflow-y: auto;
  scrollbar-width: thin;                /* Firefox */
  scrollbar-color: #b3b3b3 transparent; /* Firefox */
}

.list-scroll-container::-webkit-scrollbar {
  width: 12px; /* full track hover zone */
}

.list-scroll-container::-webkit-scrollbar-thumb {
  background: #b3b3b3;           /* text/input/hover */
  border-radius: 99px;           /* Spacing/radius/all */
  border: 5px solid transparent; /* renders thumb at 2px */
  background-clip: content-box;
}

.list-scroll-container::-webkit-scrollbar-thumb:hover,
.list-scroll-container::-webkit-scrollbar-thumb:active {
  border-width: 4px;             /* renders thumb at 4px */
}

.list-scroll-container::-webkit-scrollbar-track:hover {
  background: rgba(0, 0, 0, 0.04); /* bg/transparent/light */
}
```

> `::-webkit-scrollbar` pseudo-elements cannot be CSS-transitioned in most browsers — the `100ms`/`50ms` Smart Animate timings from Figma only apply if you build a custom (non-native) scrollbar. With native styling, the width change is instant; this is an acceptable trade-off for the accessibility benefits of native scroll.


---

## Related components

* [List Item Default](./List%20Item%20Default.md) and the other List Item variants — the rows rendered inside the scrollable container this scrollbar styles