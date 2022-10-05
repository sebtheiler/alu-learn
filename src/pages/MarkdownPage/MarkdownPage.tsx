import SEO from "@/helpers/SEO";
import md from "markdown-it";

export interface MarkdownPageProps {
  content: string;
  frontmatter: {
    title: string;
    path: string;
    description: string;
  };
}

/**
 * Renders markdown as a React page
 */
export default function MarkdownPage({
  content,
  frontmatter,
}: MarkdownPageProps) {
  return (
    <>
      <SEO
        title={frontmatter.title}
        path={frontmatter.path}
        description={frontmatter.description}
      />
      <div className="mt-28 px-10 md:px-48 md:container mx-auto prose">
        <h1 className="text-center">{frontmatter.title}</h1>
        <hr />
        <div dangerouslySetInnerHTML={{ __html: md().render(content) }} />
      </div>
    </>
  );
}
