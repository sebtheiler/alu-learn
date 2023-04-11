import { gql } from "@apollo/client";

const AutoGradeEssay = gql`
  mutation AutoGradeEssay($prompt: String!, $rubric: String!, $essay: String!) {
    autoGradeEssay(prompt: $prompt, rubric: $rubric, essay: $essay)
  }
`;

export default AutoGradeEssay;
