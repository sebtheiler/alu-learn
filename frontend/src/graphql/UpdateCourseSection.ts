import { gql } from "@apollo/client";

const UpdateCourseSection = gql`
  mutation UpdateCourseSection($courseSectionId: String!, $title: String) {
    updateCourseSection(courseSectionId: $courseSectionId, title: $title) {
      id
    }
  }
`;

export default UpdateCourseSection;
