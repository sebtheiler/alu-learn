import { t } from "../trpc";
import axios from "axios";
import { z } from "zod";
import fs from "fs/promises";
import fsSync from "fs";
import { app } from "electron";
import path from "path";

export const baseDir = path.join(app.getPath("documents"), "alu-read");

export const fileRouter = t.router({
  write: t.procedure
    .input(
      z.object({
        filePath: z.string(),
        data: z.string(),
        encoding: z.optional(z.string()),
      })
    )
    .mutation(async ({ input: { filePath, data, encoding = null } }) => {
      // TODO: this should be somewhere more "efficient", where it is only ever called once
      await fs.mkdir(baseDir, { recursive: true }); // create directory if not exist

      const pathToWriteTo = path.join(baseDir, filePath);
      return fs.writeFile(pathToWriteTo, data, encoding as BufferEncoding);
    }),
  read: t.procedure
    .input(z.string())
    .query(({ input: filePath }) =>
      fs.readFile(path.join(baseDir, filePath), "utf8")
    ),
  writeFromUrl: t.procedure
    .input(
      z.object({
        filePath: z.string(),
        url: z.string(),
      })
    )
    .mutation(async ({ input: { filePath, url } }) => {
      await fs.mkdir(baseDir, { recursive: true }); // create directory if not exist

      const pathToWriteTo = path.join(baseDir, filePath);
      axios({
        method: "GET",
        url,
        responseType: "stream",
      })
        .then((response) => {
          const pdfFile = fsSync.createWriteStream(pathToWriteTo);
          response.data.pipe(pdfFile).on("finish", () => {
            return true;
          });
        })
        .catch((error) => {
          console.error(error);
          return false;
        });
    }),
});
