import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  // Server files and root config files run in Node.js — needs process, __dirname, etc.
  {
    files: ['server/**/*.js', '*.config.{js,ts}'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  // Context providers and the app entry point export non-component values alongside
  // components by design (hooks, constants) — Fast Refresh handles them fine.
  {
    files: ['src/main.jsx', 'src/contexts/*.jsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
