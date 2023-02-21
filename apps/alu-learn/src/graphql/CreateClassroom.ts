import { gql } from "@apollo/client";

const CreateClassroom = gql`
  mutation CreateClassroom($title: String!, $courseId: String!) {
    createClassroom(title: $title, courseId: $courseId) {
      id
    }
  }
`;

export default CreateClassroom;
