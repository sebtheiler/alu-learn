# Alu

Alu is an education platform for the future. It seeks to combine the best of cutting edge and subversive pedagogical and technologic ideas into apps that are easily accessible by students, teachers, and life-long learners. Alu enables the creation of a collective _web_ of knowledge that anyone can contribute to and anyone can learn from.

* **[Alu Learn](https://alulearn.com):** An online spaced repetition system that allows you to create and share courses of flashcards with a fun, gamified interface
* **Alu Read (Alpha):** An incremental reading desktop app that allows you to read and watch thousands of articles, books, and videos simultaneously, acting as a permanent extension of your long-term memory. Currently in the alpha stage of development and not available to the public.


## Development Instructions

Alu is managed as a monorepo using [Turborepo](https://turbo.build/), allowing it to share packages between apps. It uses [pnpm](https://pnpm.io) as a package manager. Install all packages with `pnpm i`, then `cd` into an app in the `apps` directory and follow the instructions there.

### Apps

- `alu-learn`: A Next.js web application Alu Learn for studying flashcards
- `alu-read`: A Tauri/Next.js desktop application for incremental reading

### Packages
- `alu-ui`: A React component library that basic elements (e.g., Buttons, Dropdowns) for use in Alu apps
- `config`: Configuration files (e.g., `tsconfig`, Tailwind) used throughout the monorepo
- `eslint-config-custom`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `graphql-operations`: GraphQL queries and mutations that can be run again Alu Learn's GraphQL API
- `helpers-lib`: Various helper functions
- `lexical-editor`: A custom implementation of Meta's Lexical with support for LaTeX, images, flashcard links, cloze, extracts, etc.

### Develop

To develop all apps and packages, run the following command:

```
pnpm run dev
```
