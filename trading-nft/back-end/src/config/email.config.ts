import { registerAs } from '@nestjs/config';

export default registerAs('email', () => {
  return {
    host: process.env.EMAIL_HOST || 'stmp.gmail.com',
    port: process.env.EMAIL_PROT || 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  };
});
