import type { MarkdownPageProps } from "@/pages/MarkdownPage";
import fs from "fs";
import matter from "gray-matter";

/**
 * Read a markdown file and return content and frontmatter as props
 * @param fileName Markdown file to read. Automatically adds `markdown` directory prefix
 * @returns Markdown page props (content and frontmatter)
 */
const readMarkdown = (fileName: string) => {
  if (!fileName.endsWith(".md")) fileName += ".md";
  const file = fs.readFileSync(`markdown/${fileName}`, "utf-8");
  const { data: frontmatter, content } = matter(file);

  return {
    props: {
      content,
      frontmatter,
    } as MarkdownPageProps,
  };
};

export default readMarkdown;
