import { gql } from "@apollo/client";

const StreakInfo = gql`
  query Me {
    me {
      targetNumReviews
      currentStreak
      doneReviewsToday
    }
  }
`;

export default StreakInfo;
