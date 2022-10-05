import { gql } from "@apollo/client";

const MoveSubSection = gql`
  mutation MoveSubSection($courseSectionId: String!, $from: Int!, $to: Int!) {
    moveSubSection(courseSectionId: $courseSectionId, from: $from, to: $to) {
      id
    }
  }
`;

export default MoveSubSection;
