import { gql } from "@apollo/client";

const CreateMainSection = gql`
  mutation CreateMainSection($title: String!, $courseId: String!) {
    createMainSection(title: $title, courseId: $courseId) {
      id
    }
  }
`;

export default CreateMainSection;
