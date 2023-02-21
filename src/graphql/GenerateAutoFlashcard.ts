import { gql } from "@apollo/client";

const GenerateAutoFlashcard = gql`
  mutation GenerateAutoFlashcard(
    $sourceText: String!
    $numFlashcards: Int
    $language: LanguageSelectionType!
    $mode: AutoFlashcardsMode!
  ) {
    generateAutoFlashcard(
      sourceText: $sourceText
      numFlashcards: $numFlashcards
      language: $language
      mode: $mode
    )
  }
`;

export default GenerateAutoFlashcard;
