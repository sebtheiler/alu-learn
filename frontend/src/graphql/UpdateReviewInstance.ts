import { gql } from "@apollo/client";

const UpdateReviewInstance = gql`
  mutation UpdateReviewInstance(
    $reviewInstanceId: String!
    $isStarred: Boolean
  ) {
    updateReviewInstance(
      reviewInstanceId: $reviewInstanceId
      isStarred: $isStarred
    ) {
      id
    }
  }
`;

export default UpdateReviewInstance;
