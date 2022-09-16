import MarkdownPage from "@/pages/MarkdownPage";
import type { MarkdownPageProps } from "@/pages/MarkdownPage";
import readMarkdown from "helpers/readMarkdown";
import type { GetStaticProps, NextPage } from "next";

const Markdown: NextPage<MarkdownPageProps> = (props: MarkdownPageProps) => (
  <MarkdownPage {...props} />
);

export default Markdown;

export const getStaticProps: GetStaticProps = async () =>
  readMarkdown("Changelog");
