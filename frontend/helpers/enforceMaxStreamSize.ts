import { ApolloError } from "apollo-server-micro";

/**
 * Destroys a stream if it exceeds a given maximum size
 * @param stream Stream on which to enforce a max size
 * @param maxSize Maximum size in bytes.  5e+7 = 50 MB
 */
const enforceMaxStreamSize = (stream, maxSize = 5e7) => {
  let byteLength = 0;
  stream.on("data", (data: Buffer) => {
    byteLength += data.byteLength;

    // Once file size gets too big, kill all streams and halt the upload
    if (byteLength > maxSize) {
      stream.destroy(
        new ApolloError("Upload exceeds the maximum allowed size")
      );
    }
  });
};

export default enforceMaxStreamSize;
