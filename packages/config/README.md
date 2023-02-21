# Configs

These are base shared configs that other configs inherit from.

* `postcss.config.cjs` and `tailwind.config.cjs`: PostCSS and Tailwind configs
* `tsconfig.json`: Base TypeScript config

## Usage

In the `package.json` for the app/package, add:

```json
{
  ...
  "devDependencies": {
    ...
    "config": "workspace:*",
    ...
  }
}
```

For `*.cjs` configs, create the given `.cjs` file in the app/package, then write `module.exports = require("config/my-config.cjs");`. For `tsconfig.json`, use `"extends": "config/tsconfig.json" in the app/package's `tsconfig`.

N.B.: ESLint configs are handled in the `eslint-config-custom` package, not here.
