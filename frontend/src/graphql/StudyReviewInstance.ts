import { gql } from "@apollo/client";

const StudyReviewInstance = gql`
  mutation StudyReviewInstance(
    $timeTaken: Float!
    $reviewInstanceId: String!
    $grade: Grade!
  ) {
    studyReviewInstance(
      timeTaken: $timeTaken
      reviewInstanceId: $reviewInstanceId
      grade: $grade
    ) {
      id
    }
  }
`;

export default StudyReviewInstance;
