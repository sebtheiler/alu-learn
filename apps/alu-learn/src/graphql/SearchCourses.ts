import { gql } from "@apollo/client";

const SearchCourses = gql`
  query SearchCourses($title: String!) {
    searchCourses(title: $title) {
      id
      title
    }
  }
`;

export default SearchCourses;
