import getS3FilenamePrefix from "./getS3FilenamePrefix";
import s3 from "lib/s3";

/**
 * Generate a signed URL to access a file
 * @param filename File for which to generate a signed URL
 * @param expires Seconds after which the signed URL expires. Defaults to an hour
 */
const generateSignedS3URL = (filename: string, expires = 60 * 60) => {
  const filenamePrefix = getS3FilenamePrefix();
  const parsedFilename = `${filenamePrefix}/${filename}`;

  return s3.getSignedUrl("getObject", {
    Bucket: process.env.DO_SPACE_NAME as string,
    Key: parsedFilename,
    Expires: expires,
  });
};

export default generateSignedS3URL;
