import { gql } from "@apollo/client";

const StudyReviewInstance = gql`
  mutation StudyReviewInstance(
    $timezoneOffset: Int!
    $timeTaken: Int!
    $reviewInstanceId: String!
    $grade: Grade!
  ) {
    studyReviewInstance(
      timezoneOffset: $timezoneOffset
      timeTaken: $timeTaken
      reviewInstanceId: $reviewInstanceId
      grade: $grade
    ) {
      id
    }
  }
`;

export default StudyReviewInstance;
