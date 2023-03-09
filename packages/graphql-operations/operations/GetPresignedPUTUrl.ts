import { gql } from "@apollo/client";

const GetPresignedPUTUrl = gql`
query GetPresignedPUTUrl($contentType: String!) {
  getPresignedPUTUrl(contentType: $contentType)
}
`

export default GetPresignedPUTUrl;