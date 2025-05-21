import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err.stack);

  const status = err.status || 500;
  const message = err.message;

  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({ error: err.message });
  }

  // multer のファイルサイズ制限など
  if (err.name === 'MulterError') {
    return res.status(400).json({ error: err.message });
  }

  

  res.status(status).json({ error: message });
};
