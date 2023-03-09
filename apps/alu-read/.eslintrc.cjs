module.exports = {
  root: true,
  extends: ["custom"],
  overrides: [
    {
      files: ["**/*.stories.tsx"],
      rules: {
        "import/no-anonymous-default-export": "off",
      },
    },
  ],
  rules: {
    "@typescript-eslint/ban-types": "off",
  },
};
