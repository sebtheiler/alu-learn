import { gql } from "@apollo/client";

const RemoveFriend = gql`
  mutation RemoveFriend($userId: String!) {
    removeFriend(userId: $userId)
  }
`;

export default RemoveFriend;
