import { gql } from "@apollo/client";

const UpdateClassroom = gql`
  mutation UpdateClassroom(
    $classroomId: String!
    $title: String
    $courseId: String
  ) {
    updateClassroom(
      classroomId: $classroomId
      title: $title
      courseId: $courseId
    ) {
      id
    }
  }
`;

export default UpdateClassroom;
