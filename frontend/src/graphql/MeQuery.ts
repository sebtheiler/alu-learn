import type { Query } from "@/types";
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

type MeQueryType = { me: Query["me"] };

export default MeQuery;
export type { MeQueryType };
