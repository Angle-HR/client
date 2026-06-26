# Country Flag

> this are each country vector flag used as the leading icon in group input phone fields and list items.\nWe need to discuss about how flags will be handled, and it sources/reference Library in code

 ![](uploads/6452a9db-47d6-46af-80d8-e3f736460f18/89d5ef35-ba79-4270-85fc-c09ed849e278/image.png " =4704x2328")

[View in Figma →](https://www.figma.com/design/7jCMwDng7HF5g7F3tGXf0E/Open-HR?node-id=974-91525)


---

## Overview

Country Flag is a display-only sub-component that renders a flat vector flag. It is used as the INSTANCE_SWAP target in the `Group Input Left/Flag` panel (phone number country selector) and as the leading icon in `List Item Content` , and even [input](/doc/ef934d93-8038-4979-b8ff-780731203f60)  when a country or locale must be communicated visually.

There are 49 countries available. All variants share identical dimensions, only the flag artwork changes.(I need to proved a link to other flags)

**Available in:** React · Next.js · Figma (`.country`)


---

## Anatomy

| Part | Description |
|------|-------------|
| Container | `30×20px` white rectangle (`color/white/white`). Provides a consistent background for flags that include white areas. |
| Flag artwork | Layered `VECTOR` shapes composing the flag. All vectors are clipped to `30×20px`. |


---

## Spacing tokens

| Property | Value | Token |
|----------|-------|-------|
| Width    | `30px` | —     |
| Height   | `20px` | —     |
| Background | `color/white/white` | —     |

No padding or corner radius, the flag fills the full `30×20px` area edge-to-edge.


---

## Variants

### Country (`country` / Figma: `country`)

49 country and region variants:

| Value | Region |
|-------|--------|
| `Africa` | Africa (generic continent icon) |
| `Angola` | Angola |
| `Argentina` | Argentina |
| `Bahrain` | Bahrain |
| `Barbados` | Barbados |
| `Belgium` | Belgium |
| `Benin` | Benin  |
| `Botswana` | Botswana |
| `Brazil` | Brazil |
| `Cameroon` | Cameroon |
| `Canada` | Canada |
| `China` | China  |
| `Colombia` | Colombia |
| `Egypt` | Egypt  |
| `Estonia` | Estonia |
| `Ethiopia` | Ethiopia |
| `EU`  | European Union |
| `Finland` | Finland |
| `France` | France |
| `Georgia` | Georgia |
| `Guyana` | Guyana |
| `Hong Kong` | Hong Kong |
| `Iceland` | Iceland |
| `India` | India  |
| `Iran` | Iran   |
| `Ireland` | Ireland |
| `Italy` | Italy  |
| `Jamaica` | Jamaica |
| `Japan` | Japan  |
| `Kenya` | Kenya  |
| `Luxembourg` | Luxembourg |
| `Mali` | Mali   |
| `Monaco` | Monaco |
| `Morocco` | Morocco |
| `Netherlands` | Netherlands |
| `Niger` | Niger  |
| `Nigeria` | Nigeria |
| `North Macedonia` | North Macedonia |
| `Norway` | Norway |
| `Scotland` | Scotland |
| `Seychelles` | Seychelles |
| `South Africa` | South Africa |
| `Sweden` | Sweden |
| `Switzerland` | Switzerland |
| `Tanzania` | Tanzania |
| `United Kingdom` | United Kingdom |
| `United Nations` | United Nations |
| `United States` | United States |
| `Uruguay` | Uruguay |


---

## Usage guidelines

**Do** always pair a flag with the country name as a text label or `aria-label`. The flag alone does not meet accessibility requirements, colour and artwork are not reliable for all users.

**Don't** scale the flag component, it is designed specifically for `30×20px`. For other sizes, use a third-party SVG flag library.

**Do** use the `EU` variant for region-wide currency/locale contexts (e.g. Euro zone phone numbers).

**Don't** use the `Africa` variant as a fallback for an unknown African country, it renders a silhouette, not a recognisable flag. Prefer showing the country name only if the flag is unavailable.


---

## Accessibility

* Render as an `<img>` with `alt="[Country] flag"` (e.g. `alt="Nigeria flag"`) or as an `<svg>` with `aria-label="Nigeria flag"`.
* When used inside a Group Input phone field, the parent component handles the accessible label, the flag image can be `aria-hidden="true"` if the country name is already visible as text.
* When used standalone as a leading icon in a list item, include a visually hidden label if the flag is the only country indicator.


---

## Props / API

```ts
interface CountryFlagProps {
  country: 'Africa' | 'Angola' | 'Argentina' | 'Bahrain' | 'Barbados' | 'Belgium' |
           'Benin' | 'Botswana' | 'Brazil' | 'Cameroon' | 'Canada' | 'China' |
           'Colombia' | 'Egypt' | 'Estonia' | 'Ethiopia' | 'EU' | 'Finland' |
           'France' | 'Georgia' | 'Guyana' | 'Hong Kong' | 'Iceland' | 'India' |
           'Iran' | 'Ireland' | 'Italy' | 'Jamaica' | 'Japan' | 'Kenya' |
           'Luxembourg' | 'Mali' | 'Monaco' | 'Morocco' | 'Netherlands' | 'Niger' |
           'Nigeria' | 'North Macedonia' | 'Norway' | 'Scotland' | 'Seychelles' |
           'South Africa' | 'Sweden' | 'Switzerland' | 'Tanzania' | 'United Kingdom' |
           'United Nations' | 'United States' | 'Uruguay'
  className?: string
}
```

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `country` | Country union (49 values) | —       | **Yes**  | Which flag to display. Figma: `country` variant |
| `className` | `string` | —       | No       | Additional CSS class |


---

## Code examples

```tsx
// Next.js (App Router), Server Component
// No 'use client' directive needed, purely display, no browser state.

// Inside a group input phone prefix
<CountryFlag country="Nigeria" />

// Accessible standalone usage
<CountryFlag
  country="United Kingdom"
  className="flag-icon"
  // render as <img alt="United Kingdom flag"> or <svg aria-label="United Kingdom flag">
/>

// Mapping a locale to a flag (only map locales that have a corresponding variant)
const LOCALE_FLAG: Partial<Record<string, CountryFlagProps['country']>> = {
  'en-GB': 'United Kingdom',
  'en-US': 'United States',
  'fr-FR': 'France',
  'nl-NL': 'Netherlands',
  // 'de-DE' → no Germany variant in the current set; omit and handle fallback separately
}
```

```tsx
// React
// Inside a group input phone prefix
<CountryFlag country="Nigeria" />

// Accessible standalone usage
<CountryFlag
  country="United Kingdom"
  className="flag-icon"
  // render as <img alt="United Kingdom flag"> or <svg aria-label="United Kingdom flag">
/>

// Mapping a locale to a flag (only map locales with a corresponding variant)
const LOCALE_FLAG: Partial<Record<string, CountryFlagProps['country']>> = {
  'en-GB': 'United Kingdom',
  'en-US': 'United States',
  'fr-FR': 'France',
  'nl-NL': 'Netherlands',
  // 'de-DE' → no Germany variant in current set
}
```


---

## Related components

* [Group Input Left/Flag](/doc/5ca5e050-00b7-4ae6-9dbc-37a8d7cc7150), uses Country Flag as the phone-field country selector icon
* [List Item Content](/doc/3c37aab7-2a32-4ac3-b5a5-a113869307e9), accepts Country Flag as the leading icon INSTANCE_SWAP