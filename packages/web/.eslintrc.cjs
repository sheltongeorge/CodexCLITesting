module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.app.json',
    tsconfigRootDir: __dirname
  },
  plugins: ['@typescript-eslint', 'import', 'react-refresh'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:react-refresh/recommended',
    'prettier'
  ],
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.app.json'
      }
    }
  },
  rules: {
    'import/order': [
      'error',
      {
        groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
        newlines-between: 'never',
        alphabetize: { order: 'asc', caseInsensitive: true }
      }
    ],
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: false
      }
    ]
  }
};
