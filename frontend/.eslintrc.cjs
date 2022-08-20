const path = require("path");

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "cypress"],
  extends: [
    "eslint:recommended",
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:storybook/recommended",
    "plugin:cypress/recommended",
  ],
  rules: {
    "@typescript-eslint/ban-ts-ignore": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-explicit-any": "off",
  },
};
