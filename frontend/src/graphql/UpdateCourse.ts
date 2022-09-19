import { gql } from "@apollo/client";

const UpdateCourse = gql`
  mutation UpdateCourse(
    $courseId: String!
    $privacySetting: PrivacySetting
    $editingAccess: EditingAccess
    $title: String
    $coursePassword: String
  ) {
    updateCourse(
      courseId: $courseId
      privacySetting: $privacySetting
      editingAccess: $editingAccess
      title: $title
      coursePassword: $coursePassword
    ) {
      id
    }
  }
`;

export default UpdateCourse;
