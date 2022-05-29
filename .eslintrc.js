module.exports = {
  root: true,
  env: {
    node: true,
    'vue/setup-compiler-macros': true
  },
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/standard',
    '@vue/typescript/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  ignorePatterns: ['src/core/xmlToAss.js'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    camelcase: 'off',
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'no-prototype-builtins': 'off',
    'eol-last': 'off',
    'no-useless-escape': 'off',
    'no-useless-constructor': 'off'
  }
}
