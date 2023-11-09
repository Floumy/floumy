import { registerAs } from "@nestjs/config";

export default registerAs("jwt", () => ({
  refreshToken: {
    secret: "thisisnotsosecret",
    expiresIn: "30d"
  },
  accessToken: {
    secret: "thisisnotsosecret",
    expiresIn: "1d"
  }
}));
