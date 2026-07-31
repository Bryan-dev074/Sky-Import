import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescript from 'eslint-config-next/typescript'

/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'playwright-report/**',
      'test-results/**',
      'next-env.d.ts',
    ],
  },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-restricted-globals': [
        'error',
        {
          name: 'Intl',
          message:
            'El dinero y las fechas se formatean a mano (src/lib/money). Intl produce cadenas distintas en servidor y navegador y rompe la hidratación.',
        },
      ],
    },
  },
]

export default config
