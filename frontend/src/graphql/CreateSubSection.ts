import { gql } from "@apollo/client";

const CreateSubSection = gql`
  mutation CreateSubSection(
    $title: String!
    $mainSectionId: String!
    $courseId: String!
  ) {
    createSubSection(
      title: $title
      mainSectionId: $mainSectionId
      courseId: $courseId
    ) {
      title
      id
    }
  }
`;

export default CreateSubSection;
