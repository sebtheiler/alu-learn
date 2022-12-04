import { gql } from "@apollo/client";

const GenerateAutoFlashcard = gql`
  mutation GenerateAutoFlashcard(
    $sourceText: String!
    $mode: AutoFlashcardsMode!
    $numFlashcards: Int
  ) {
    generateAutoFlashcard(
      sourceText: $sourceText
      mode: $mode
      numFlashcards: $numFlashcards
    )
  }
`;

export default GenerateAutoFlashcard;
