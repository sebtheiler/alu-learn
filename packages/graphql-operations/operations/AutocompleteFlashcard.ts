import { gql } from "@apollo/client";

const AutocompleteFlashcard = gql`
  mutation AutocompleteFlashcard($front: String!) {
    autocompleteFlashcard(front: $front)
  }
`;

export default AutocompleteFlashcard;
