import { gql } from "@apollo/client";

const MyFriends = gql`
  query MyFriends {
    myFriends
  }
`;

export default MyFriends;
