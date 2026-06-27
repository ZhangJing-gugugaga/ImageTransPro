import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  js.configs.recommended,
  {
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        URL: 'readonly',
        FileReader: 'readonly',
        Image: 'readonly',
        HTMLCanvasElement: 'readonly',
        crypto: 'readonly',
        alert: 'readonly',
        localStorage: 'readonly',
      },
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'electron/**'],
  },
]
