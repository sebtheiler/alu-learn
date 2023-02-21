import getS3FilenamePrefix from "./getS3FilenamePrefix";
import s3 from "lib/s3";
import stream from "stream";

/**
 * Allows a read stream to be streamed directly into S3 for file uploads
 * @param filename Location to upload on the bucket. Automatically prefixed into the correct folder.
 * @param contentType Type of file to save (optional)
 * @param isPublic Is the file accessible to anyone? Defaults to false
 * @returns `writeStream` for writing data and `promise` for checking status
 * @example Pipe readstream to upload
 * ```js
 *  const { writeStream, promise } = uploadStream(filename)
 *  const readStream = createReadStream();
 *  readStream.pipe(writeStream)
 * ```
 * @example Check promise
 * ```js
 * try {
 *   await promise;
 *   console.log('upload completed successfully');
 * } catch (error) {
 *   console.error('upload failed.', error.message);
 * }
 * @see https://stackoverflow.com/a/50291380/10226703
 */
const uploadStreamToS3 = (
  filename: string,
  contentType?: string,
  isPublic = false
) => {
  const pass = new stream.PassThrough();
  const filenamePrefix = getS3FilenamePrefix();
  const parsedFilename = `${filenamePrefix}/${filename}`;

  return {
    writeStream: pass,
    promise: s3
      .upload({
        Bucket: process.env.DO_SPACE_NAME as string,
        Key: parsedFilename,
        Body: pass,
        ContentType: contentType,
        ACL: isPublic ? "public-read" : "private",
      })
      .promise(),
  };
};

export default uploadStreamToS3;
