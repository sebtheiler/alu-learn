import { gql } from "@apollo/client";

const DeleteCourseSection = gql`
  mutation DeleteCourseSection($courseSectionId: String!) {
    deleteCourseSection(courseSectionId: $courseSectionId) {
      id
    }
  }
`;

export default DeleteCourseSection;
