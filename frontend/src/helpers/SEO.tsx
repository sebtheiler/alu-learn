import { NextSeo } from "next-seo";
import Head from "next/head";

// types
export type SEOProps = {
  path: string;
  title: string;
  description?: string;
  ogImagePath?: string;
  noindex?: boolean;
  noTitleTemplate?: boolean;
  seoJson?: any;
};

const SEO: React.FC<SEOProps> = ({
  path,
  title = "Alu Learn",
  description = "", // TODO: (SEO) set description and better OG image
  ogImagePath = "/assets/logo.svg",
  noindex,
  noTitleTemplate,
  seoJson,
}) => {
  const APP_ROOT_URL = process.env.NEXT_PUBLIC_APP_ROOT_URL;

  // Absolute page url
  const pageUrl = APP_ROOT_URL + path;
  // Absolute og image url
  const ogImageUrl = APP_ROOT_URL + ogImagePath;

  // const stringified = JSON.stringify(seoJson)
  // console.log(stringified)
  // console.log(typeof stringified)
  const _seoJson = {
    "@context": "https://schema.org/",
    "@type": "Quiz",
    about: {
      "@type": "Thing",
      name: "Cell Transport",
    },
    educationalAlignment: [
      {
        "@type": "AlignmentObject",
        alignmentType: "educationalSubject",
        targetName: "Biology",
      },
    ],
    hasPart: [
      {
        "@context": "https://schema.org/",
        "@type": "Question",
        eduQuestionType: "Flashcard",
        text: "This is some fact about receptor molecules.",
        acceptedAnswer: {
          "@type": "Answer",
          text: "receptor molecules",
        },
      },
      {
        "@context": "https://schema.org/",
        "@type": "Question",
        eduQuestionType: "Flashcard",
        text: "This is some fact about the cell membrane.",
        acceptedAnswer: {
          "@type": "Answer",
          text: "cell membrane",
        },
      },
    ],
  };

  return (
    <>
      {seoJson && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(seoJson) }}
          />
          {/* <script type="application/ld+json">{`{"@context":"https://schema.org/","@type":"Quiz","about":{"@type":"Thing","name":"test"},"educationalAlignment":[{"@type":"AlignmentObject","alignmentType":"educationalSubject","targetName":"test"}],"hasPart":[{"@context":"https://schema.org/","@type":"Question","eduQuestionType":"Flashcard","text":"#1 (#2)","acceptedAnswer":{"@type":"Answer","text":"#1"}},{"@context":"https://schema.org/","@type":"Question","eduQuestionType":"Flashcard","text":"#2","acceptedAnswer":{"@type":"Answer","text":"#2"}},{"@context":"https://schema.org/","@type":"Question","eduQuestionType":"Flashcard","text":"#3","acceptedAnswer":{"@type":"Answer","text":"#3"}},{"@context":"https://schema.org/","@type":"Question","eduQuestionType":"Flashcard","text":"#4","acceptedAnswer":{"@type":"Answer","text":"#4"}},{"@context":"https://schema.org/","@type":"Question","eduQuestionType":"Flashcard","text":"#5","acceptedAnswer":{"@type":"Answer","text":"#5"}},{"@context":"https://schema.org/","@type":"Question","eduQuestionType":"Flashcard","text":"#6","acceptedAnswer":{"@type":"Answer","text":"#6"}},{"@context":"https://schema.org/","@type":"Question","eduQuestionType":"Flashcard","text":"alt #1","acceptedAnswer":{"@type":"Answer","text":"alt #1"}},{"@context":"https://schema.org/","@type":"Question","eduQuestionType":"Flashcard","text":"alt #2","acceptedAnswer":{"@type":"Answer","text":"alt #2"}}]}`}</script> */}
          {/* <script type="application/ld+json">{JSON.stringify(JSON.parse(`{
      "@context": "https://schema.org/",
      "@type": "Quiz",
      "about": {
        "@type": "Thing",
        "name": "Cell Transport"
      },
      "educationalAlignment": [
        {
          "@type": "AlignmentObject",
          "alignmentType": "educationalSubject",
          "targetName": "Biology"
        }
      ],
      "hasPart": [
        {
          "@context": "https://schema.org/",
          "@type": "Question",
          "eduQuestionType": "Flashcard",
          "text": "This is some fact about receptor molecules.",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "receptor molecules"
          }
        },
        {
          "@context": "https://schema.org/",
          "@type": "Question",
          "eduQuestionType": "Flashcard",
          "text": "This is some fact about the cell membrane.",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "cell membrane"
          }
        }
      ]
    }`))}</script> */}
        </Head>
      )}
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
    </>
  );
};

export default SEO;
