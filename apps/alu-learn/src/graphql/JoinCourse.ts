import { gql } from "@apollo/client";

const JoinCourse = gql`
  mutation JoinCourse($courseId: String!) {
    joinCourse(courseId: $courseId) {
      id
    }
  }
`;

export default JoinCourse;
