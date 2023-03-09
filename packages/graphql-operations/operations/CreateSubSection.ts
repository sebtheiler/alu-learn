import { gql } from "@apollo/client";

const CreateSubSection = gql`
  mutation CreateSubSection($title: String!, $courseSectionId: String!) {
    createSubSection(title: $title, courseSectionId: $courseSectionId) {
      id
      title
      slug
    }
  }
`;

export default CreateSubSection;
