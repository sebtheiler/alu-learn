import { gql } from "@apollo/client";

const CreateCourseSection = gql`
  mutation CreateCourseSection($title: String!, $courseId: String!) {
    createCourseSection(title: $title, courseId: $courseId) {
      id
    }
  }
`;

export default CreateCourseSection;
