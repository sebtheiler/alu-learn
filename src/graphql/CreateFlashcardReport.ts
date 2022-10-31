import { gql } from "@apollo/client";

const CreateFlashcardReport = gql`
  mutation CreateFlashcardReport($reasons: String!, $flashcardId: String!) {
    createFlashcardReport(reasons: $reasons, flashcardId: $flashcardId) {
      id
    }
  }
`;

export default CreateFlashcardReport;
