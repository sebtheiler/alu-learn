import { NextSeo } from "next-seo";

// types
export type SEOProps = {
  path: string;
  title: string;
  description?: string;
  ogImagePath?: string;
  noindex?: boolean;
  noTitleTemplate?: boolean;
};

const SEO: React.FC<SEOProps> = ({
  path,
  title = "Alu Learn",
  description = "", // TODO: (SEO) set description and better OG image
  ogImagePath = "/assets/logo.svg",
  noindex,
  noTitleTemplate,
}) => {
  const APP_ROOT_URL = process.env.NEXT_PUBLIC_APP_ROOT_URL;

  // Absolute page url
  const pageUrl = APP_ROOT_URL + path;
  // Absolute og image url
  const ogImageUrl = APP_ROOT_URL + ogImagePath;

  return (
    <NextSeo
      title={noTitleTemplate ? title : `${title} - Alu Learn`}
      canonical={pageUrl}
      description={description}
      noindex={noindex}
      openGraph={{
        title,
        description,
        url: pageUrl,
        images: [
          {
            url: ogImageUrl,
          },
        ],
        type: "article",
        site_name: "AluLearn",
      }}
      twitter={{
        cardType: "summary_large_image",
      }}
    />
  );
};

export default SEO;
