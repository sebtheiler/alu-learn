# Alu

TODO: Add a description

## Development Instructions

Alu is managed as a monorepo using [Turborepo](https://turbo.build/), allowing it to share packages between apps. It uses [pnpm](https://pnpm.io) as a package manager. Install all packages with `pnpm i`, then `cd` into a app in the `apps` directory and follow the instructions there.

### Apps and Packages

- `alu-learn`: A Next.js web application Alu Learn for studying flashcards
- `alu-read`: A Tauri/Next.js desktop application for incremental reading
- `alu-ui`: A React component library that basic elements (e.g., Buttons, Dropdowns) for use in Alu apps
- `eslint-config-custom`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `config`: Configuration files (e.g., `tsconfig`, Tailwind) used throughout the monorepo

### Develop

To develop all apps and packages, run the following command:

```
pnpm run dev
```
