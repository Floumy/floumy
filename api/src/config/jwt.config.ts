import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  refreshToken: {
    secret: process.env.JWT_SECRET,
    expiresIn: '30d',
  },
  accessToken: {
    secret: process.env.JWT_SECRET,
    expiresIn: '1d',
  },
}));
