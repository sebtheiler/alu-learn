import { gql } from "@apollo/client";

const CalculateReviewInstanceIntervalQuery = gql`
  query CalculateReviewInstanceIntervalQuery(
    $reviewInstance: JSONObject!
    $grade: Grade!
    $algorithm: Algorithm!
  ) {
    calculateReviewInstanceInterval(
      reviewInstance: $reviewInstance
      grade: $grade
      algorithm: $algorithm
    )
  }
`;

export default CalculateReviewInstanceIntervalQuery;
