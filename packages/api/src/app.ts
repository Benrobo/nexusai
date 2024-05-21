import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import { requestLogger } from "./middlewares/logger";
import bodyParser from "body-parser";
import logger from "./config/logger";
import HandleErrors from "./middlewares/error";
import { Routes } from "./types";
import cookieParser from "cookie-parser";
import session from "express-session";

// init dot env
dotenv.config();

export default class App {
  public app: express.Application;
  public env: string | undefined;
  public port: string | number;

  constructor() {
    this.app = express();
    this.port = process.env.PORT ?? 4001;
    this.initializeMiddlewares();
  }

  initDB() {
    // * initialization of the database
  }

  initializeMiddlewares() {
    // initialize server middlewares
    this.app.use(requestLogger);
    this.app.use(
      cors({
        origin: true,
        credentials: true,
      })
    );
    this.app.options("*", cors()); // enable pre-flight?
    this.app.use(
      bodyParser.json({
        // @ts-ignore
        // ( just so rawBody is available during WH validation)
        verify: (req: Request, res: Response, buf) => (req["rawBody"] = buf),
      })
    );
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(cookieParser());
    this.app.set("trust proxy", 1);
    this.app.use(
      session({
        secret: process.env.JWT_SECRET!,
        resave: false,
        saveUninitialized: true,
        cookie: {
          secure: true,
          sameSite: "none",
          maxAge: 24 * 60 * 60 * 1000,
        },
      })
    );
  }

  listen() {
    // initialize database
    this.initDB();
    // listen on server port
    this.app.listen(this.port, () => {
      logger.info("Server started at http://localhost:" + this.port);
    });
  }

  initializedRoutes(routes: Routes[]) {
    // initialize all routes middleware
    routes.forEach((route) => {
      this.app.use("/api", route.router);
    });

    this.app.get("/", (req, res) => {
      res.json({
        message: "Welcome to NexusAI API",
      });
    });

    this.app.all("*", (req, res) => {
      res.status(404);
      return res.json({ message: "404 Not Found" });
    });
    // handle global errors
    this.app.use(HandleErrors);
  }
}
