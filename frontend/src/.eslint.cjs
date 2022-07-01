const path = require("path");

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  alias: [
    { find: '@', replacement: path.resolve(__dirname, '/src') }
  ],
};