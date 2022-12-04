import { gql } from "@apollo/client";

const GenerateAutoFlashcard = gql`
  mutation GenerateAutoFlashcard($sourceText: String!) {
    generateAutoFlashcard(sourceText: $sourceText)
  }
`;

export default GenerateAutoFlashcard;
