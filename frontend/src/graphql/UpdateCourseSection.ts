import { gql } from "@apollo/client";

const UpdateCourseSection = gql`
  mutation UpdateCourseSection(
    $courseSectionId: String!
    $title: String
    $color: String
    $description: String
  ) {
    updateCourseSection(
      courseSectionId: $courseSectionId
      title: $title
      color: $color
      description: $description
    ) {
      id
    }
  }
`;

export default UpdateCourseSection;
