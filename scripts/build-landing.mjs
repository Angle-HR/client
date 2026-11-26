// Builds the public landing site (the `(open-hr)` route group) as a static export in ./out-landing.
//
// The app proper (dashboard, login, company/[slug], ...) has dynamic routes and client-only session logic that a static
// export can't serve, and the server bundle for it runs on ECS. So this builds a trimmed copy of the repo in
// .landing-build/ that keeps only the `(open-hr)` routes, with `output: 'export'`, and leaves the real app untouched.
//
//   node scripts/build-landing.mjs        ->  out-landing/  (sync this to the landing bucket)
//
// The marketing landing/waitlist pages are gone: the static site now only holds the legal pages (/terms,
// /privacy-policy, plus /privacy as an alias). The root `/` is not a page of its own: it is a small redirect document
// that sends visitors to the app (APP_URL, default https://tryopenhr.com), where signed-in users land on
// /dashboard and everyone else on /login. Redirect status codes are not available on a static bucket, so this uses
// a meta refresh with a visible link as the fallback.
import { spawnSync } from 'node:child_process'
import {
  appendFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const work = join(root, '.landing-build')
const output = join(root, 'out-landing')
const KEEP_ROUTES = new Set(['(open-hr)'])
const SKIP_COPY = new Set(['node_modules', '.next', '.git', 'out', 'out-landing', '.landing-build'])

rmSync(work, { recursive: true, force: true })
rmSync(output, { recursive: true, force: true })
mkdirSync(work)

for (const entry of readdirSync(root)) {
  if (!SKIP_COPY.has(entry)) cpSync(join(root, entry), join(work, entry), { recursive: true })
}
rmSync(join(work, 'public', 'flags'), { recursive: true, force: true }) // only the app uses these
symlinkSync(join(root, 'node_modules'), join(work, 'node_modules'), 'dir')

// Drop every route except the landing group (and the root layout / global styles / icons).
const appDir = join(work, 'app')
for (const entry of readdirSync(appDir, { withFileTypes: true })) {
  const isRoute = entry.isDirectory() && !KEEP_ROUTES.has(entry.name)
  if (isRoute || entry.name === 'page.tsx')
    rmSync(join(appDir, entry.name), { recursive: true, force: true })
}

// Metadata route handlers must be marked static for `output: 'export'`.
const manifest = join(appDir, 'manifest.ts')
if (existsSync(manifest)) appendFileSync(manifest, "\nexport const dynamic = 'force-static'\n")

// Static export config. Redirects/rewrites/headers are not supported (or needed) here: the Lambda sets security headers.
rmSync(join(work, 'next.config.ts'))
writeFileSync(
  join(work, 'next.config.mjs'),
  `export default {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: { root: ${JSON.stringify(root)} },
  typescript: { ignoreBuildErrors: true },
}
`,
)

const build = spawnSync('npx', ['next', 'build'], {
  cwd: work,
  stdio: 'inherit',
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
})
if (build.status !== 0) process.exit(build.status ?? 1)

cpSync(join(work, 'out'), output, { recursive: true })
if (!existsSync(join(output, 'terms', 'index.html'))) {
  console.error('expected out-landing/terms/index.html')
  process.exit(1)
}
if (!existsSync(join(output, 'privacy-policy', 'index.html'))) {
  console.error('expected out-landing/privacy-policy/index.html')
  process.exit(1)
}
// /privacy is the address the terms text points at; serve the same page there.
mkdirSync(join(output, 'privacy'), { recursive: true })
cpSync(join(output, 'privacy-policy', 'index.html'), join(output, 'privacy', 'index.html'))

const appUrl = (process.env.APP_URL || 'https://tryopenhr.com').replace(/\/+$/, '')
writeFileSync(
  join(output, 'index.html'),
  `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Open HR</title>
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=${appUrl}/">
<link rel="canonical" href="${appUrl}/">
</head>
<body>
<p>Redirecting to <a href="${appUrl}/">Open HR</a>. <a href="/terms/">Terms</a> &middot; <a href="/privacy/">Privacy</a></p>
<script>location.replace(${JSON.stringify(appUrl + '/')})</script>
</body>
</html>
`,
)
rmSync(work, { recursive: true, force: true })
console.log('landing site built in out-landing/')
