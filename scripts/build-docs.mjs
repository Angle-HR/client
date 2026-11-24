// Builds the data behind the live docs at /docs, so the pages always match
// the code:
//   - props tables, read from the components' TypeScript types
//   - example source, read from docs/examples and syntax-highlighted
//   - design tokens, read from styles/design-system/*.css
// Runs from `dev` and `build` (and `npm run docs:gen`). Output goes to
// docs/generated, which is gitignored and rebuilt on every run.
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import docgen from 'react-docgen-typescript'
import { createHighlighter } from 'shiki'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const out = resolve(root, 'docs/generated')
await mkdir(out, { recursive: true })

/* ── Props ──────────────────────────────────────────────────────────────── */

// Components that have a docs page. Add a line here when a page is added.
const documented = [
  { file: 'components/ui/button/button.tsx', name: 'Button' },
  { file: 'components/ui/button/icon-button.tsx', name: 'IconButton' },
  { file: 'components/ui/button/text-button.tsx', name: 'TextButton' },
  { file: 'components/ui/button/flow-button.tsx', name: 'FlowButton' },
  { file: 'components/ui/button/label-button.tsx', name: 'LabelButton' },
]

const parser = docgen.withCustomConfig(resolve(root, 'tsconfig.json'), {
  savePropValueAsString: true,
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  // Keep the component's own props; native HTML attributes are summarised
  // under the table instead of listed one by one.
  propFilter: (prop) => !prop.parent || !prop.parent.fileName.includes('node_modules'),
})

const props = {}
for (const { file, name } of documented) {
  const parsed = parser.parse(resolve(root, file)).find((c) => c.displayName === name)
  if (!parsed) throw new Error(`build-docs: ${name} not found in ${file}`)
  props[name] = Object.values(parsed.props)
    .map((p) => ({
      name: p.name,
      type: p.type.raw && p.type.raw.length < 120 ? p.type.raw : p.type.name,
      values: Array.isArray(p.type.value) ? p.type.value.map((v) => v.value) : null,
      required: p.required,
      defaultValue: p.defaultValue?.value ?? null,
      description: p.description || '',
    }))
    .sort((a, b) => Number(b.required) - Number(a.required))
}

/* ── Examples ───────────────────────────────────────────────────────────── */

const highlighter = await createHighlighter({
  themes: ['github-light', 'github-dark-default'],
  langs: ['tsx', 'css'],
})

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => [])
  const files = await Promise.all(
    entries.map((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)])),
  )
  return files.flat()
}

const examples = {}
for (const file of (await walk(resolve(root, 'docs/examples'))).filter((f) => f.endsWith('.tsx'))) {
  const key = relative(resolve(root, 'docs/examples'), file).replace(/\.tsx$/, '')
  // Hide lines marked `// docs-hide` (e.g. the demo's own wrapper styling).
  const code = (await readFile(file, 'utf8'))
    .split('\n')
    .filter((line) => !line.includes('// docs-hide'))
    .join('\n')
    .trim()
  examples[key] = {
    code,
    html: highlighter.codeToHtml(code, {
      lang: 'tsx',
      themes: { light: 'github-light', dark: 'github-dark-default' },
      defaultColor: false,
    }),
  }
}

/* ── Tokens ─────────────────────────────────────────────────────────────── */

const css = (name) => readFile(resolve(root, 'styles/design-system', name), 'utf8')
const [primitivesCss, tokensCss, typographyCss, spacingCss, shadowsCss] = await Promise.all(
  ['primitives.css', 'tokens.css', 'typography.css', 'spacing.css', 'shadows.css'].map(css),
)

const declRe = /--([\w-]+)\s*:\s*([^;]+);/g
const vars = (text) =>
  Object.fromEntries([...text.matchAll(declRe)].map((m) => [m[1], m[2].trim()]))

// Splits a block into "── Group ──" sections, keeping declaration order.
function grouped(block) {
  const groups = []
  let current = { name: 'Other', tokens: [] }
  for (const line of block.split('\n')) {
    const heading = line.match(/\/\*\s*[─-]+\s*(.+?)\s*[─-]+\s*\*\//)
    if (heading) {
      if (current.tokens.length) groups.push(current)
      current = { name: heading[1], tokens: [] }
      continue
    }
    const decl = line.match(/^\s*--([\w-]+)\s*:\s*([^;]+);/)
    if (decl) current.tokens.push({ name: decl[1], value: decl[2].trim() })
  }
  if (current.tokens.length) groups.push(current)
  return groups
}

function blockAfter(text, marker) {
  const start = text.indexOf(marker)
  if (start < 0) throw new Error(`build-docs: "${marker}" not found`)
  const open = text.indexOf('{', start)
  let depth = 0
  for (let i = open; i < text.length; i++) {
    if (text[i] === '{') depth++
    if (text[i] === '}' && --depth === 0) return text.slice(open + 1, i)
  }
  throw new Error(`build-docs: unclosed block after "${marker}"`)
}

const primitives = vars(primitivesCss)
const resolvePrimitive = (value) => {
  const m = value.match(/^var\(--([\w-]+)\)$/)
  if (!m) return { ref: null, value }
  return { ref: m[1], value: primitives[m[1]] ?? value }
}

const lightBlock = blockAfter(tokensCss, ':root {')
const darkVars = vars(blockAfter(tokensCss, ':root[data-theme="dark"]'))
const colours = grouped(lightBlock).map((g) => ({
  name: g.name,
  tokens: g.tokens.map((t) => ({
    name: t.name,
    light: resolvePrimitive(t.value),
    dark: resolvePrimitive(darkVars[t.name] ?? t.value),
  })),
}))

const primitiveGroups = grouped(blockAfter(primitivesCss, ':root {'))

const typeVars = vars(typographyCss)
const px = (value) => {
  const ref = value.match(/var\(--([\w-]+)\)/)?.[1]
  const raw = ref ? typeVars[ref] : value
  if (!raw) return value
  const rem = raw.match(/^(-?[\d.]+)rem$/)
  return rem ? `${+(parseFloat(rem[1]) * 16).toFixed(2)}px` : raw
}
const typography = []
for (const m of typographyCss.matchAll(/((?:\.[\w-]+,?\s*)+)\{([^}]*font-size[^}]*)\}/g)) {
  const classes = m[1]
    .split(',')
    .map((s) => s.trim().slice(1))
    .filter(Boolean)
  const body = vars(
    m[2].replace(/(font-size|line-height|letter-spacing|font-family)\s*:/g, '--$1:'),
  )
  typography.push({
    name: classes[0].replace(/-(regular|medium|semibold)$/, ''),
    classes,
    size: px(body['font-size']),
    lineHeight: px(body['line-height']),
    letterSpacing:
      body['letter-spacing'] && !/^0(px|em|rem)?$/.test(px(body['letter-spacing']))
        ? px(body['letter-spacing'])
        : null,
    mono: (body['font-family'] ?? '').includes('mono'),
  })
}

const spacing = grouped(blockAfter(spacingCss, ':root {'))
const shadows = grouped(blockAfter(shadowsCss, ':root {'))

// Icon library: public/dashboard/icons holds each Figma icon as
// <name>-outline.svg and <name>-solid.svg (plus a few one-off assets).
const iconFiles = await readdir(resolve(root, 'public/dashboard/icons'))
const icons = [
  ...new Set(
    iconFiles
      .filter((f) => /-(outline|solid)\.svg$/.test(f))
      .map((f) => f.replace(/-(outline|solid)\.svg$/, '')),
  ),
].sort()

const tokens = { colours, primitives: primitiveGroups, typography, spacing, shadows, icons }

/* ── Write ──────────────────────────────────────────────────────────────── */

await Promise.all([
  writeFile(join(out, 'props.json'), JSON.stringify(props, null, 2)),
  writeFile(join(out, 'examples.json'), JSON.stringify(examples, null, 2)),
  writeFile(join(out, 'tokens.json'), JSON.stringify(tokens, null, 2)),
])
console.log(
  `build-docs: ${Object.keys(props).length} props tables, ${Object.keys(examples).length} examples, ` +
    `${colours.reduce((n, g) => n + g.tokens.length, 0)} colour tokens, ${typography.length} text styles, ${icons.length} icons`,
)
