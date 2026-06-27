// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format

import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import storybook from 'eslint-plugin-storybook'

// eslint-config-next already enables eslint-plugin-import and eslint-plugin-jsx-a11y.
// This block adds stricter import ordering without re-registering plugins (which would error).
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    name: 'angle-hr/import-order',
    rules: {
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
  eslintConfigPrettier,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'storybook-static/**',
    'playwright-report/**',
    'test-results/**',
    'next-env.d.ts',
  ]),
  ...storybook.configs['flat/recommended'],
])

export default eslintConfig
