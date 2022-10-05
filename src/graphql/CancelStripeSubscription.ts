import { gql } from "@apollo/client";

const CancelStripeSubscription = gql`
  mutation Mutation {
    cancelStripeSubscription
  }
`;

export default CancelStripeSubscription;
