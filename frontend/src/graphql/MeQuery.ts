import { gql } from "@apollo/client";

const MeQuery = gql`
  query Me {
    me {
      currentStreak
      doneReviewsToday
      isPro
    }
  }
`;

export default MeQuery;
