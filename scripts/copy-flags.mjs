// Copies the `flag-icons` 4x3 SVG set into `public/flags` so <CountryFlag>
// can resolve a flag by ISO code at runtime (`/flags/ng.svg`) instead of
// bundling all 271 flag components. Runs from `dev` and `build`; the output
// directory is gitignored and regenerated on every run.
import { cp, mkdir, rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = resolve(root, 'node_modules/flag-icons/flags/4x3')
const destination = resolve(root, 'public/flags')

await rm(destination, { recursive: true, force: true })
await mkdir(destination, { recursive: true })
await cp(source, destination, { recursive: true })
