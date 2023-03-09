import { Article, Extract } from "./src/generated/client";

export type ArticleType = "LEXICAL" | "PDF" | "ONLINE_VIDEO";
export type Object =
  | { type: "ARTICLE"; article: Article }
  | { type: "EXTRACT"; extract: Extract };
export type MergedObject =
  | (Article & { objectType: "ARTICLE" })
  | (Extract & { objectType: "EXTRACT" });
