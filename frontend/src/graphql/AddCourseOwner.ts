import { gql } from "@apollo/client";

const AddCourseOwner = gql`
  mutation AddCourseOwner($username: String!, $courseId: String!) {
    addCourseOwner(username: $username, courseId: $courseId) {
      id
    }
  }
`;

export default AddCourseOwner;
