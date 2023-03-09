import { gql } from "@apollo/client";

const UploadCourseBannerImage = gql`
  mutation UploadCourseBannerImage($courseId: String!, $bannerImage: Upload) {
    uploadCourseBannerImage(courseId: $courseId, bannerImage: $bannerImage) {
      id
    }
  }
`;

export default UploadCourseBannerImage;
