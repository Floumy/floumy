import { registerAs } from "@nestjs/config";

export default registerAs("fileStorage", () => ({
  endpoint: process.env.SPACES_ENDPOINT,
  forcePathStyle: false,
  region: process.env.SPACES_REGION, // Must be "us-east-1" when creating new Spaces. Otherwise, use the region in your endpoint (for example, nyc3).
  credentials: {
    accessKeyId: process.env.SPACES_KEY,
    secretAccessKey: process.env.SPACES_SECRET
  }
}));
