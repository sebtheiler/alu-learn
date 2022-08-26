import { gql } from "@apollo/client";

const CreateFlashcard = gql`
  mutation CreateFlashcard(
    $fields: JSONObject!
    $courseSectionSlug: String!
    $courseId: String!
    $subSectionSlug: String!
    $flashcardType: FlashcardType!
    $tags: String
  ) {
    createFlashcard(
      fields: $fields
      courseId: $courseId
      courseSectionSlug: $courseSectionSlug
      subSectionSlug: $subSectionSlug
      flashcardType: $flashcardType
      tags: $tags
    ) {
      id
    }
  }
`;

export default CreateFlashcard;
