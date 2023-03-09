# Alu Read

Alu Read is an incremental reading desktop app that allows you to read and watch thousands of articles, books, and videos simultaneously, acting as a permanent extension of your long-term memory. Currently in the alpha stage of development and not available to the public.

## Development

- `pnpm dev`: Start the development server
  - Make sure to also start Alu Learn's development server if using the flashcard creator
- `pnpm start`: Build and start the built server
- `pnpm dist`: Package Electron into the final release. Out put is in the `packed` directory.

## `electron-prisma-trpc-example`

Alu Read's structure was inspired by [awohletz/electron-prisma-trpc-example](https://github.com/awohletz/electron-prisma-trpc-example/tree/react) with import modifications made to support Next.js instead of Vite.
