import { gql } from "@apollo/client";

const UpdateAssignment = gql`
  mutation UpdateAssignment(
    $assignmentId: String!
    $title: String
    $essentialOnly: Boolean
  ) {
    updateAssignment(
      assignmentId: $assignmentId
      title: $title
      essentialOnly: $essentialOnly
    ) {
      id
    }
  }
`;

export default UpdateAssignment;
