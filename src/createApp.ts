import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import postRoutes from './routes/posts';
import profileRoutes from './routes/profile';
import imageRoutes from './routes/postsImage';
import { errorHandler } from './middlewares/errorHandler';
import { ErrorRequestHandler } from 'express';

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use('/posts', postRoutes);
  app.use('/profile', profileRoutes);
  app.use('/posts-image', imageRoutes);

  app.use(errorHandler as ErrorRequestHandler);

  return app;
};
