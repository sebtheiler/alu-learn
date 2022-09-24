import { gql } from "@apollo/client";

const RemoveStudentFromClassroom = gql`
  mutation JoinClassroom($studentId: String!, $classroomId: String!) {
    removeStudentFromClassroom(
      studentId: $studentId
      classroomId: $classroomId
    ) {
      id
    }
  }
`;

export default RemoveStudentFromClassroom;
