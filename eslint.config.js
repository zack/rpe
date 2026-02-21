import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier/flat';
import react from 'eslint-plugin-react';
import reactCompiler from 'eslint-plugin-react-compiler';
import stylistic from '@stylistic/eslint-plugin'
import tsParser from '@typescript-eslint/parser';
import tseslint from 'typescript-eslint';

import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  prettier,

  globalIgnores([
    'build/**',
    'dist/**',
    'out/**',
  ]),

  {
    // Fix for ESLint 10+: eslint-plugin-react uses context.getFilename() (legacy API)
    // which was removed in ESLint 10 flat config. Declaring the version explicitly
    // prevents the plugin from trying to auto-detect it and failing.
    settings: {
      react: {
        version: '19',
      },
    },

    plugins: {
      react,
      '@stylistic': stylistic,
    },

    languageOptions: {
      globals: {},
      parser: tsParser,
    },

    rules: {
      'react-compiler/react-compiler': 'error',
      'sort-imports': ['error', {
        memberSyntaxSortOrder: ['none', 'all', 'single', 'multiple'],
      }],
      'no-console': ['error'],
      '@/quotes': ['error', 'single', {
        avoidEscape: true,
      }],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
    },
  },

  eslint.configs.recommended,
  reactCompiler.configs.recommended,
  tseslint.configs.recommended,
]);
