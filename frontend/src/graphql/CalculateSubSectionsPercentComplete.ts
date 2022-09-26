import { gql } from "@apollo/client";

const CalculateSubSectionsPercentComplete = gql`
  query CalculateSubSectionsPercentComplete($subSectionIds: [String!]!) {
    calculateSubSectionsPercentComplete(subSectionIds: $subSectionIds)
  }
`;

export default CalculateSubSectionsPercentComplete;
