import { gql } from "@apollo/client";

const DeleteCourse = gql`
  mutation Mutation($courseId: String!) {
    deleteCourse(courseId: $courseId) {
      id
    }
  }
`;
export default DeleteCourse;
