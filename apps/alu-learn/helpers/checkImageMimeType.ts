import { ApolloError } from "@apollo/client";

/**
 * Check that a given mime type is a valid image mime type. Throws `ApolloError` if it is not
 * @param mimeType Mime type to validate
 */
const checkImageMimeType = (mimeType: string) => {
  if (!mimeType.startsWith("image")) {
    throw new ApolloError({
      errorMessage: `Content type not supported: ${mimeType}`,
    });
  }
};

export default checkImageMimeType;
