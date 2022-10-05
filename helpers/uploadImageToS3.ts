import checkImageMimeType from "./checkImageMimeType";
import enforceMaxStreamSize from "./enforceMaxStreamSize";
import uploadStreamToS3 from "./uploadStreamToS3";
import { ManagedUpload } from "aws-sdk/clients/s3";
import type { Upload } from "graphql-upload";

interface ImageUploadOptions {
  /**
   * Maximum size in bytes. Defaults to 5e+7 = 50 MB
   */
  maxSize?: number;
  /**
   * Is the image publically accessible?  Defaults to false
   */
  isPublic?: boolean;
}

/**
 * Upload an image to spaces from an upload argument and a filename destination
 * @param upload Image to upload (e.g., `args.image`)
 * @param filename Location to upload on the bucket. Automatically prefixed into the correct folder.
 * @param options Specify options for the upload
 * @returns A promise of the sent data
 */
const uploadImageToS3 = async (
  upload: Upload,
  filename: string,
  options: ImageUploadOptions = {}
): Promise<ManagedUpload.SendData> => {
  const { maxSize = 5e7, isPublic = false } = options;

  // Get the uploaded image from the client
  const image = await upload.promise;
  const { createReadStream, mimetype } = image;
  checkImageMimeType(mimetype);

  // Upload the image to Digital Ocean spaces by piping
  // the stream from the client
  const { writeStream, promise } = uploadStreamToS3(
    filename,
    mimetype,
    isPublic
  );
  const readStream = createReadStream();
  enforceMaxStreamSize(readStream.pipe(writeStream), maxSize);

  return promise;
};

export default uploadImageToS3;
