import { gql } from "@apollo/client";

const UpdateCourse = gql`
  mutation UpdateCourse(
    $courseId: String!
    $privacySetting: PrivacySetting
    $editingAccess: EditingAccess
    $title: String
    $description: String
    $isPublic: Boolean
    $seoDescription: String
    $seoSubject: String
  ) {
    updateCourse(
      courseId: $courseId
      privacySetting: $privacySetting
      editingAccess: $editingAccess
      title: $title
      description: $description
      isPublic: $isPublic
      seoDescription: $seoDescription
      seoSubject: $seoSubject
    ) {
      id
    }
  }
`;

export default UpdateCourse;
