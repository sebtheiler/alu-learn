import { gql } from "@apollo/client";

const CreateAssignment = gql`
  mutation CreateAssignment(
    $title: String!
    $subSectionIds: [String!]!
    $classroomIds: [String!]!
  ) {
    createAssignment(
      title: $title
      subSectionIds: $subSectionIds
      classroomIds: $classroomIds
    ) {
      id
    }
  }
`;

export default CreateAssignment;
