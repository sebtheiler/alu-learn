import { gql } from "@apollo/client";

const CreateAssignment = gql`
  mutation CreateAssignment(
    $title: String!
    $essentialOnly: Boolean!
    $subSectionIds: [String!]!
    $classroomIds: [String!]!
  ) {
    createAssignment(
      title: $title
      essentialOnly: $essentialOnly
      subSectionIds: $subSectionIds
      classroomIds: $classroomIds
    ) {
      id
    }
  }
`;

export default CreateAssignment;
