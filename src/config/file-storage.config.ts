import { registerAs } from "@nestjs/config";
import * as process from "process";

export default registerAs("fileStorage", () => ({
  endpoint: process.env.SPACES_ENDPOINT,
  bucket: process.env.SPACES_BUCKET,
  bucketEndpoint: process.env.SPACES_BUCKET_ENDPOINT,
  forcePathStyle: process.env.SPACES_FORCE_PATH_STYLE === "true",
  region: process.env.SPACES_REGION, // Must be "us-east-1" when creating new Spaces. Otherwise, use the region in your endpoint (for example, nyc3).
  credentials: {
    accessKeyId: process.env.SPACES_KEY,
    secretAccessKey: process.env.SPACES_SECRET
  }
}));
