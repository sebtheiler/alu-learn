import s3 from "../../../lib/s3";
import getS3FilenamePrefix from "./getS3FilenamePrefix";
import stream from "stream";

/**
 * Allows a read stream to be streamed directly into S3 for file uploads
 * @param filename Location to upload on the bucket. Automatically prefixed into the correct folder.
 * @returns `writeStream` and `promise`
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
 *   console.log('upload failed.', error.message);
 * }
 * @see https://stackoverflow.com/a/50291380/10226703
 */
const uploadStreamToS3 = (filename: string) => {
  const pass = new stream.PassThrough();
  const filenamePrefix = getS3FilenamePrefix();
  return {
    writeStream: pass,
    promise: s3
      .upload({
        Bucket: process.env.DO_SPACE_NAME as string,
        Key: `${filenamePrefix}/${filename}`,
        Body: pass,
      })
      .promise(),
  };
};

export default uploadStreamToS3;
