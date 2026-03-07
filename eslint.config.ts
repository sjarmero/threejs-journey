import js from '@eslint/js';
import ts from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import html from '@html-eslint/eslint-plugin';
import htmlParser from '@html-eslint/parser';
import globals from 'globals';
import stylistic from '@stylistic/eslint-plugin';

export default ts.config(
  {
    ignores: ['dist/', 'node_modules/', 'coverage/**']
  },

  // Logic & Framework Rules
  js.configs.recommended,
  ...ts.configs.recommended,
  ...pluginVue.configs['flat/recommended'],

  // 1. HTML Support (using eslint-html)
  {
    files: ['**/*.html'],
    languageOptions: {
      parser: htmlParser,
    },
    plugins: {
      html,
    },
    rules: {
      ...html.configs.recommended.rules,
    },
  },

  // 2. Global DOM Support
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
  },

  // 3. Formatting & Indentation (Fixes missing indentation linting)
  {
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      '@stylistic/indent': ['error', 2],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error', 'always'],
    }
  },

  // 4. Vue + TypeScript Integration
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
      },
    },
  },

  // 5. Specific Rules for Frameworks
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/html-indent': ['error', 2],
      'vue/script-indent': ['error', 2, { 'baseIndent': 0 }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  }
);