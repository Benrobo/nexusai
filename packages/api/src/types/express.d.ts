import { Multer } from "multer";

declare global {
  namespace Express {
    export interface Request {
      rawBody: any;
      file?: Multer.File;
    }
  }
}
