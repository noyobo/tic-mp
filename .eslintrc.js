module.exports = {
  env: {
    es6: true,
    node: true,
  },
  globals: {
    File: true, // browser
    Promise: false,
    wx: true,
    App: true,
    Page: true,
    Component: true,
    requirePlugin: true,
    Behavior: true,
    getDate: true,
    getApp: true,
    getCurrentPages: true,
  },
  extends: ['prettier', 'plugin:promise/recommended', 'eslint:recommended'],
  plugins: ['promise'],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off',
    'no-unused-vars': ['error', { vars: 'all', args: 'none', ignoreRestSiblings: true }],
    'promise/always-return': 'error',
  },
};
