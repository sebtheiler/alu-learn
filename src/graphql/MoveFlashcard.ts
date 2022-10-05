import { gql } from "@apollo/client";

const MoveFlashcard = gql`
  mutation MoveFlashcard(
    $courseId: String!
    $subSectionSlug: String!
    $from: Int!
    $to: Int!
  ) {
    moveFlashcard(
      courseId: $courseId
      subSectionSlug: $subSectionSlug
      from: $from
      to: $to
    ) {
      id
    }
  }
`;

export default MoveFlashcard;
