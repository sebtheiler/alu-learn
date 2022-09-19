import { gql } from "@apollo/client";

const RemoveCourseOwner = gql`
  mutation RemoveCourseOwner($username: String!, $courseId: String!) {
    removeCourseOwner(username: $username, courseId: $courseId) {
      id
    }
  }
`;

export default RemoveCourseOwner;
