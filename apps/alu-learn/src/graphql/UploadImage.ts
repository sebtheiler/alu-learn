import { gql } from "@apollo/client";

const UploadImage = gql`
  mutation UploadImage($image: Upload!) {
    uploadImage(image: $image) {
      id
      url
      width
      height
    }
  }
`;

export default UploadImage;
