import { gql } from "@apollo/client";

const GetCourseSubSections = gql`
  query GetCourseSubSections($courseId: String!) {
    getCourseSubSections(courseId: $courseId) {
      title
      slug
      id
    }
  }
`;
export default GetCourseSubSections;
