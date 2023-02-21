# Alu UI

Alu UI is a React component library that ships 

To use in a different Alu app/package add `"alu-ui": "workspace:*"` as a dependency in the project's `package.json`, then import components as follows:

```typescript
import Button from "alu-ui/src/Button";

<Button onClick={() => console.log("Hello world!")}>
  My Button
</Button>
```

## Development

Alu UI is developed using Storybook. Start the Storybook server through `pnpm dev`, then make any changes and document them in the Storybook.
