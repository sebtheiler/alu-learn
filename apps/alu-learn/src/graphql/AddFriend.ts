import { gql } from "@apollo/client";

const AddFriend = gql`
  mutation AddFriend($userId: String!) {
    addFriend(userId: $userId)
  }
`;

export default AddFriend;
