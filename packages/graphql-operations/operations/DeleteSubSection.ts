import { gql } from "@apollo/client";

const DeleteSubSection = gql`
  mutation DeleteSubSection($subSectionId: String!) {
    deleteSubSection(subSectionId: $subSectionId) {
      id
    }
  }
`;

export default DeleteSubSection;
