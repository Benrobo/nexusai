import * as express from "express";

declare global {
  namespace Express {
    export interface Request {
      rawBody: any;
      file?: Express.Multer.File;
    }
  }
}
