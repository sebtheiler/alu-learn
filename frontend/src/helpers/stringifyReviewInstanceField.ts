import type { ReviewInstanceWithFlashcard } from "@/types";

const stringifyReviewInstanceField = (
  reviewInstance: ReviewInstanceWithFlashcard,
  i: number
): string =>
  JSON.stringify(JSON.parse(reviewInstance.flashcard.fields as string)[i]);

export default stringifyReviewInstanceField;
