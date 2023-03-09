import { articleRouter } from "./routers/article";
import { extractRouter } from "./routers/extract";
import { fileRouter } from "./routers/file";
import { topicRouter } from "./routers/topic";
import { learnRouter } from "./routers/learn";
import { electronRouter } from "./routers/electron";
import { t } from "./trpc";

export const appRouter = t.router({
  article: articleRouter,
  topic: topicRouter,
  file: fileRouter,
  extract: extractRouter,
  learn: learnRouter,
  electron: electronRouter,
});

export type AppRouter = typeof appRouter;
