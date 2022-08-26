import { gql } from "@apollo/client";

const CreateSubSection = gql`
  mutation CreateSubSection($title: String!, $courseSectionId: String!) {
    createSubSection(title: $title, courseSectionId: $courseSectionId) {
      title
      id
    }
  }
`;

export default CreateSubSection;
