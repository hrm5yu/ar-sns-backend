export interface MulterRequest extends Request {
  file?: Express.Multer.File;
}