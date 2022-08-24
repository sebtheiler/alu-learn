/**
 * Get a filename prefix to put uploads in the correct folder
 * @returns "development" if running in development and "uploads" if running in production
 */
const getS3FilenamePrefix = () =>
  process.env.NODE_ENV === "development" ? "dev" : "uploads";
export default getS3FilenamePrefix;
