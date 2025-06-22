import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import globals from 'globals';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default tseslint.config(
  {
    ignores: ["node_modules/*", ".next/*", ".out/*"],
  },
  // Base config for JS/TS files (applied broadly)
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'warn',
    },
  },
  // TypeScript specific configurations
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true, // Shorthand for './tsconfig.json' relative to eslint.config.mjs
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      // You can add more specific TypeScript rules here if needed
    },
  },
  // Next.js specific configurations
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'], // Apply to all relevant Next.js files
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      // Apply Next.js recommended rules
      ...nextPlugin.configs.recommended.rules,
      // Explicitly apply core-web-vitals rules
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
    settings: {
      next: {
        // Point to the root directory of your Next.js project
        rootDir: __dirname,
      }
    }
  },
  // JSX-A11y specific configurations
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'], // Apply to all relevant JSX files
    plugins: {
      'jsx-a11y': jsxA11yPlugin,
    },
    rules: {
      ...jsxA11yPlugin.configs.recommended.rules,
      // You can customize or override jsx-a11y rules here if needed
    },
  }
);
