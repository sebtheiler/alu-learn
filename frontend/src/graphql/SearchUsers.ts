import { gql } from "@apollo/client";

const SearchUsers = gql`
  query SearchUsers($name: String!) {
    searchUsers(name: $name) {
      id
      username
      name
      image
    }
  }
`;

export default SearchUsers;
