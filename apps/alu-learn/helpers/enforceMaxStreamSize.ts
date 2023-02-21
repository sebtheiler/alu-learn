import { ApolloError } from "@apollo/client";

/**
 * Destroys a stream if it exceeds a given maximum size
 * @param stream Stream on which to enforce a max size
 * @param maxSize Maximum size in bytes.  5e+7 = 50 MB
 * @returns The stream and a promise that completes when the stream is done piping
 */
const enforceMaxStreamSize = (stream, maxSize = 5e7) => {
  let byteLength = 0;
  stream.on("data", (data: Buffer) => {
    byteLength += data.byteLength;

    // Once file size gets too big, kill all streams and halt the upload
    if (byteLength > maxSize) {
      stream.destroy(
        new ApolloError({
          errorMessage: "Upload exceeds the maximum allowed size",
        })
      );
    }
  });

  return {
    stream,
    promise: new Promise((fulfill) => stream.on("finish", fulfill)),
  };
};

export default enforceMaxStreamSize;
