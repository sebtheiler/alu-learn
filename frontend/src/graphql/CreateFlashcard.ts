import { gql } from "@apollo/client";

const CreateFlashcard = gql`
  mutation CreateFlashcard(
    $fields: JSONObject!
    $courseSectionSlug: String!
    $subSectionSlug: String!
    $flashcardType: FlashcardType!
    $tags: String
  ) {
    createFlashcard(
      fields: $fields
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
