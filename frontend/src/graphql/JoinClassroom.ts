import { gql } from "@apollo/client";

const JoinClassroom = gql`
  mutation JoinClassroom($joinCode: String!) {
    joinClassroom(joinCode: $joinCode) {
      id
    }
  }
`;

export default JoinClassroom;
