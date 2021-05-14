module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-tabs': 'off',
    'no-mixed-spaces-and-tabs': 'off',
    'no-useless-escape': 'off',
    'no-prototype-builtins': 'off',
    'no-useless-return': 'off'
  }
}
