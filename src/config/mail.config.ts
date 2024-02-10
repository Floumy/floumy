import { registerAs } from "@nestjs/config";

export default registerAs("mail", () => ({
  user: process.env.MAIL_USER,
  clientId: process.env.MAIL_CLIENT_ID,
  clientSecret: process.env.MAIL_CLIENT_SECRET,
  refreshToken: process.env.MAIL_REFRESH_TOKEN,
  accessToken: process.env.MAIL_ACCESS_TOKEN
}));
