import { gql } from "@apollo/client";

const FindHardestReviewInstances = gql`
  query FindHardestReviewInstances($courseId: String!, $skip: Int) {
    findHardestReviewInstances(courseId: $courseId, skip: $skip) {
      ease
      flashcard {
        fields
        id
        tags
      }
    }
  }
`;

export default FindHardestReviewInstances;
