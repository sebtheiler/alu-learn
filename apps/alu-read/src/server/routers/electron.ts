import { t } from "../trpc";
import { z } from "zod";
import { BrowserView } from "electron";
import { createId } from "@paralleldrive/cuid2";
import { win } from "../main";
import path from "path";

const browserViews = new Map<string, BrowserView>();

export const electronRouter = t.router({
  newBrowserView: t.procedure
    .input(
      z.object({
        url: z.string(),
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
      })
    )
    .mutation(({ input: { url, x, y, width, height } }) => {
      const preload = path.join(__dirname, "browserViewPreload.js");
      const view = new BrowserView({
        webPreferences: {
          // TODO: also probably really bad
          webSecurity: false,
          contextIsolation: true,
          preload,
        },
      });
      win.addBrowserView(view);
      view.setBounds({
        x,
        y,
        width,
        height,
      });
      view.webContents.loadURL(url);

      const id = createId();
      browserViews.set(id, view);

      return id;
    }),
  resizeBrowserView: t.procedure
    .input(
      z.object({
        id: z.string(),
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
      })
    )
    .mutation(({ input: { id, x, y, width, height } }) => {
      const view = browserViews.get(id);
      if (!view) throw new Error("Couldn't get browser view from ID");
      view.setBounds({ x, y, width, height });
    }),
  destroyBrowserView: t.procedure
    .input(z.string())
    .mutation(({ input: id }) => {
      const view = browserViews.get(id);
      if (!view) throw new Error("Couldn't get browser view from ID");
      win.removeBrowserView(view);
      browserViews.delete(id);
    }),
});
