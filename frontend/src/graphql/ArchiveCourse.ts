import { gql } from "@apollo/client";

const ArchiveCourse = gql`
  mutation ArchiveCourse($courseId: String!, $archive: Boolean!) {
    archiveCourse(courseId: $courseId, archive: $archive) {
      id
    }
  }
`;

export default ArchiveCourse;
