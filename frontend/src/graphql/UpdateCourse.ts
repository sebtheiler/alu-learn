import { gql } from "@apollo/client";

const UpdateCourse = gql`
  mutation Mutation($title: String, $courseId: String!) {
    updateCourse(title: $title, courseId: $courseId) {
      id
    }
  }
`;

export default UpdateCourse;
