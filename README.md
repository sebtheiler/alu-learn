# Deprecation Notice

Alu is a project I worked on in high school, which is quite some time ago now. I have not had the time to maintain it over the past few years. I have written instructions on self-hosting Alu Learn below. Other than the minimal changes required to sunset the project, all code is provided as-is from when I last worked on the project. I make no guarantee to fix issues going forward.

With that said, the container still runs and provides--at least in my opinion--a quite powerful piece of spaced repetition software. You can feel free to fork this repo to revitalize the project if you'd like. It is GPLv3 licensed.

## Setup Instructions
Ensure you have Docker and Docker compose (or equivalently Podman). Then,

```sh
docker-compose build
docker-compose up -d
docker exec -it alu-learn npx prisma db push --schema=apps/alu-learn/prisma/schema.prisma
```

Alternatively, with Podman,
```sh
podman compose build
podman compose up -d
podman exec -it alu-learn npx prisma db push --schema=apps/alu-learn/prisma/schema.prisma
```

You can visit `http://localhost:3000`. Create an account using the register button and any email (no email will actually be sent). To view the magic sign-in link, go to `http://localhost:1080`.

## Disclaimer

Generative AI was used to assist creating the Dockerfile. No generative AI was used in the rest of the project, as the rest of the project was written before these tools were released.

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
