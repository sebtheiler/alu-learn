import { gql } from "@apollo/client";

const MoveCourseSection = gql`
  mutation MoveCourseSection($courseId: String!, $from: Int!, $to: Int!) {
    moveCourseSection(courseId: $courseId, from: $from, to: $to) {
      id
    }
  }
`;

export default MoveCourseSection;
