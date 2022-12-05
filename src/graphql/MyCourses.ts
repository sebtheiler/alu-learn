import { gql } from "@apollo/client";

const MyCourses = gql`
  query MyCourses {
    myCourses {
      id
      title
    }
  }
`;

export default MyCourses;
