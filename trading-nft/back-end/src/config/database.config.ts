import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/meme-server',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
}));
