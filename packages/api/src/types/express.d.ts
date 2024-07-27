import { Multer } from "multer";

declare global {
  namespace Express {
    export interface Request {
      rawBody: string;
      file?: Multer.File;
    }
  }
}
