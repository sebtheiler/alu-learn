import type { Query } from "@/types";
import { gql } from "@apollo/client";

const GetFlashcard = gql`
  query GetFlashcard($flashcardId: String!) {
    getFlashcard(flashcardId: $flashcardId) {
      id
      fields
      tags
      type
    }
  }
`;

type GetFlashcardType = { getFlashcard: Query["getFlashcard"] };

export default GetFlashcard;
export type { GetFlashcardType };
