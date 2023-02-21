import { gql } from "@apollo/client";

const UploadImageFromUrl = gql`
  mutation UploadImageFromUrl($url: String!) {
    uploadImageFromUrl(url: $url) {
      id
      url
      width
      height
    }
  }
`;

export default UploadImageFromUrl;
