import { gql } from "@apollo/client";

const UpdateCourse = gql`
  mutation UpdateCourse(
    $courseId: String!
    $privacySetting: PrivacySetting
    $editingAccess: EditingAccess
    $title: String
    $coursePassword: String
    $description: String
  ) {
    updateCourse(
      courseId: $courseId
      privacySetting: $privacySetting
      editingAccess: $editingAccess
      title: $title
      coursePassword: $coursePassword
      description: $description
    ) {
      id
    }
  }
`;

export default UpdateCourse;
