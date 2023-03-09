import { gql } from "@apollo/client";

const UpdateSubSection = gql`
  mutation UpdateSubSection($subSectionId: String!, $title: String) {
    updateSubSection(subSectionId: $subSectionId, title: $title) {
      id
    }
  }
`;

export default UpdateSubSection;
