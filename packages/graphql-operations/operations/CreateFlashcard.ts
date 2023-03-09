import { gql } from "@apollo/client";

const CreateFlashcard = gql`
  mutation CreateFlashcard(
    $fields: String!
    $extractId: String
    $isForAluRead: Boolean
    $subSectionSlug: String
    $courseSectionSlug: String
    $courseId: String
    $flashcardType: FlashcardType
    $tags: String
  ) {
    createFlashcard(
      fields: $fields
      extractId: $extractId
      isForAluRead: $isForAluRead
      subSectionSlug: $subSectionSlug
      courseSectionSlug: $courseSectionSlug
      courseId: $courseId
      flashcardType: $flashcardType
      tags: $tags
    ) {
      id
    }
  }
`;

export default CreateFlashcard;
