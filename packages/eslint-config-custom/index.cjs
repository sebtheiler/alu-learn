// This acts as a `.eslintrc.cjs`
module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "cypress"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    // "plugin:@storybook/recommended",
    // "plugin:cypress/recommended",
    "next",
    "turbo",
    "prettier"
  ],
  rules: {
    "@typescript-eslint/ban-ts-ignore": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-explicit-any": "off",
  },
};
