import { gql } from "@apollo/client";

const FindHardestSubSections = gql`
  query FindHardestSubSections($courseId: String!) {
    findHardestSubSections(courseId: $courseId)
  }
`;

export default FindHardestSubSections;
