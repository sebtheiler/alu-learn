ESLint resolves configuration files by looking for workspaces with the name `eslint-config-*`. This lets us write `extends: ['custom']` and have ESLint find our local workspace.

In each app/package, import `eslint-config-custom` as a dev dependency in `package.json` with `"eslint-config-custom": "workspace:*"`. Then create a `.eslintrc.cjs` file and include the following:

```js
module.exports = {
  root: true,
  extends: ["custom"],
};
```

See the [Turbo documentation on `eslint-config-custom`](https://turbo.build/repo/docs/getting-started/create-new#understanding-eslint-config-custom) for more information.

