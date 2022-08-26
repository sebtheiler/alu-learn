import s3 from "../lib/s3";
import getS3FilenamePrefix from "./getS3FilenamePrefix";

/**
 * Deletes a file from the default bucket
 * @param filename File to delete. Automatically prefixed into the correct folder.
 */
const deleteFileFromS3 = (filename: string) => {
  const filenamePrefix = getS3FilenamePrefix();
  s3.deleteObject({
    Bucket: process.env.DO_SPACE_NAME as string,
    Key: `${filenamePrefix}/${filename}`,
  });
};

export default deleteFileFromS3;
