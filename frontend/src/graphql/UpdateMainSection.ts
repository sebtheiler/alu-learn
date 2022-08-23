import { gql } from "@apollo/client";

const UpdateMainSection = gql`
  mutation UpdateMainSection($mainSectionId: String!, $title: String) {
    updateMainSection(mainSectionId: $mainSectionId, title: $title) {
      id
    }
  }
`;

export default UpdateMainSection;
