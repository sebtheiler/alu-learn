import flattenLexical from "@/helpers/flattenLexical";
import { Flashcard } from "@/types";

/**
 * Generates the `hasPart` data for the flashcards Education Q&A rich search result
 * @param flashcards Flashcards to generate SEO has part for
 * @returns `hasPart` data for the flashcards Education Q&A SEO attribute
 * @see https://developers.google.com/search/docs/appearance/structured-data/education-qa
 */
const flashcardsSEO = async (flashcards: Flashcard[]) => {
  const fronts: string[] = [];
  const backs: string[] = [];
  for (const flashcard of flashcards) {
    const front = JSON.stringify(JSON.parse(flashcard.fields as string)[0]);
    const back = JSON.stringify(JSON.parse(flashcard.fields as string)[1]);
    const flattenedFront = front && (await flattenLexical(front));
    const flattenedBack = back && (await flattenLexical(back));

    if (flattenedFront && flattenedBack) {
      fronts.push(flattenedFront);
      backs.push(flattenedBack);
    }
  }

  return fronts.map((front, i) => ({
    "@context": "https://schema.org/",
    "@type": "Question",
    eduQuestionType: "Flashcard",
    text: front,
    acceptedAnswer: {
      "@type": "Answer",
      text: backs[i],
    },
  }));
};

export default flashcardsSEO;
