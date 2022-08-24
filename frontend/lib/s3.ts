import { Endpoint, S3 } from "aws-sdk";

const spacesEndpoint = new Endpoint("nyc3.digitaloceanspaces.com");
const s3 = new S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export default s3;
