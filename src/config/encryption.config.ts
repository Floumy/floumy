import {registerAs} from '@nestjs/config';

export default registerAs('encryption', () => ({
    rounds: process.env.ENCRYPTION_ROUNDS || 10,
}));
