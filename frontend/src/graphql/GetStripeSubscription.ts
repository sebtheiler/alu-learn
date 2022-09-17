import { gql } from "@apollo/client";

const GetStripeSubscription = gql`
  query GetStripeSubscription {
    getStripeSubscription
  }
`;

export default GetStripeSubscription;
