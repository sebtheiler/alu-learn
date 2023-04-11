import { gql } from "@apollo/client";

const AutoEssayFeedback = gql`
  mutation AutoEssayFeedback(
    $prompt: String!
    $rubric: String!
    $essay: String!
    $grades: String!
  ) {
    autoEssayFeedback(
      prompt: $prompt
      rubric: $rubric
      essay: $essay
      grades: $grades
    )
  }
`;

export default AutoEssayFeedback;
