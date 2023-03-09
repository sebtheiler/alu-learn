import { gql } from "@apollo/client";

const CreateStripeSession = gql`
  mutation CreateStripeSession($item: StripeItem!) {
    createStripeSession(item: $item)
  }
`;

export default CreateStripeSession;
