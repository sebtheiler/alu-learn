import { gql } from "@apollo/client";

const CreateCourse = gql`
  mutation Mutation($title: String!) {
    createCourse(title: $title) {
      id
    }
  }
`;

export default CreateCourse;
