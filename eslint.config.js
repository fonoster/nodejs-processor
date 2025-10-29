const js = require('@eslint/js');
const typescript = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const prettier = require('eslint-plugin-prettier');
const notice = require('eslint-plugin-notice');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: {
        process: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      prettier,
      notice,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      quotes: ['error', 'double'],
      'notice/notice': [
        'error',
        {
          mustMatch: 'Licensed under the MIT License',
          templateFile: '.scripts/copyright.js',
        },
      ],
      'no-console': 1,
      'prettier/prettier': 2,
    },
  },
];
