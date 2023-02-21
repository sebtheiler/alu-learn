import { ApolloError } from "@apollo/client";
import axios from "axios";
import cuid from "cuid";
import fs from "fs";
import checkImageMimeType from "helpers/checkImageMimeType";
import enforceMaxStreamSize from "helpers/enforceMaxStreamSize";
import getUserGQL from "helpers/getUserGQL";
import uploadImageToS3 from "helpers/uploadImageToS3";
import uploadStreamToS3 from "helpers/uploadStreamToS3";
import sizeOf from "image-size";
import { arg, extendType, nonNull, objectType, stringArg } from "nexus";

const CHROME_USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36";
const ALU_USER_AGENT =
  "AluLearn.com Image Proxy. Alu is a free education site. Learn more: https://alulearn.com/legal/imageproxy/ ";
const USER_AGENT =
  process.env.NODE_ENV === "development" ? CHROME_USER_AGENT : ALU_USER_AGENT;

const UploadedImage = objectType({
  name: "UploadedImage",
  definition(t) {
    t.string("id");
    t.string("url");
    t.int("width");
    t.int("height");
    t.field("uploadedBy", {
      type: "User",
      resolve(uploadedImage, _, ctx) {
        return ctx.prisma.user.findUnique({
          // @ts-ignore
          where: { id: uploadedImage.uploadedById },
        });
      },
    });
  },
});

export default UploadedImage;

export const UploadedImagesMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("uploadImage", {
      type: UploadedImage,
      description: "Upload an image",
      args: {
        image: nonNull(
          arg({
            type: "Upload",
            description: "File object to stream upload",
          })
        ),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx);
        if (!user) return null;

        const uploadedImageId = cuid();
        const filename = `uploadedImages/upload-${uploadedImageId}`;

        try {
          // NOTE: While this implies that uploaded images are viewable by everyone,
          // one would still need to know their randomly generated CUID, which makes
          // it practically impossible to actually access
          const { Location: url } = await uploadImageToS3(
            args.image,
            filename,
            { isPublic: true }
          );

          return ctx.prisma.uploadedImage.create({
            data: {
              id: uploadedImageId,
              url,
              uploadedBy: {
                connect: {
                  id: user.id,
                },
              },
            },
          });
        } catch (error) {
          throw new ApolloError({
            errorMessage: `Upload failed: ${(error as any).message}`,
          });
        }
      },
    });
    t.field("uploadImageFromUrl", {
      type: UploadedImage,
      description: "Upload an image from a URL",
      args: {
        url: nonNull(stringArg()),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx);
        if (!user) return null;

        const uploadedImageId = cuid();
        const filename = `uploadedImages/upload-${uploadedImageId}`;

        // Get the stream from the given image
        const resp = await axios.get(args.url, {
          headers: {
            "User-Agent": USER_AGENT,
          },
          responseType: "stream",
        });

        const mimetype = resp.headers["content-type"];
        checkImageMimeType(mimetype);

        // Write a temporary file and get its dimensions
        // There is probably a better way to do this, but it
        // is complicated with streams and S3
        const tmpFilename = `/tmp/upload-${uploadedImageId}.png`;
        const writeStream = fs.createWriteStream(tmpFilename);
        try {
          await enforceMaxStreamSize(resp.data.pipe(writeStream)).promise;
        } catch (e) {
          // Delete the temporary file if there's an error (e.g., exceeded max size)
          fs.unlink(tmpFilename, (err) => {
            if (err) throw err;
          });
          throw e;
        }
        const { width, height } = sizeOf(tmpFilename);

        try {
          const tmpfileReadStream = fs.createReadStream(tmpFilename);
          const { writeStream, promise } = uploadStreamToS3(
            filename,
            mimetype,
            true
            // NOTE: While this implies that uploaded images are viewable by everyone,
            // one would still need to know their randomly generated CUID, which makes
            // it practically impossible to actually access
          );
          tmpfileReadStream.pipe(writeStream); // don't need to enforce max size, since we already did
          const { Location: url } = await promise;

          // Delete tempfile
          fs.unlink(tmpFilename, (err) => {
            if (err) throw err;
          });

          return ctx.prisma.uploadedImage.create({
            data: {
              id: uploadedImageId,
              url,
              width,
              height,
              uploadedBy: {
                connect: {
                  id: user.id,
                },
              },
            },
          });
        } catch (error) {
          throw new ApolloError({
            errorMessage: `Upload failed: ${(error as any).message}`,
          });
        }
      },
    });
  },
});
