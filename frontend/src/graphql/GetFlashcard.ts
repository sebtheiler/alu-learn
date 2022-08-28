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
export default GetFlashcard;
