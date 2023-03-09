import { gql } from "@apollo/client";

const UpdateUploadedImage = gql`mutation UpdateUploadedImage($updateUploadedImageId: String!, $url: String!) {
  updateUploadedImage(id: $updateUploadedImageId, url: $url) {
    id
  }
}`

export default UpdateUploadedImage;