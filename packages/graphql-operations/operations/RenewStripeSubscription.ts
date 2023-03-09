import { gql } from "@apollo/client";

const RenewStripeSubscription = gql`
  mutation Mutation {
    renewStripeSubscription
  }
`;

export default RenewStripeSubscription;
