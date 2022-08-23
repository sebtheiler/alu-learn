import { gql } from "@apollo/client";

const CreateSubSection = gql`
  mutation CreateSubSection(
    $title: String!
    $courseSectionId: String!
    $courseId: String!
  ) {
    createSubSection(
      title: $title
      courseSectionId: $courseSectionId
      courseId: $courseId
    ) {
      title
      id
    }
  }
`;

export default CreateSubSection;
