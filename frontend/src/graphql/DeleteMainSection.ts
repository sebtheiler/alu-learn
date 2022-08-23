import { gql } from "@apollo/client";

const DeleteMainSection = gql`
  mutation DeleteMainSection($mainSectionId: String!) {
    deleteMainSection(mainSectionId: $mainSectionId) {
      id
    }
  }
`;

export default DeleteMainSection;
