import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import { requestLogger } from "./middlewares/logger.js";
import bodyParser from "body-parser";
import logger from "./config/logger.js";
import HandleErrors from "./middlewares/error.js";
import { Routes } from "./types";
import cookieParser from "cookie-parser";
import session from "express-session";
import { TwilioService } from "./services/twilio.service.js";
import GeminiService from "./services/gemini.service.js";
import fs from "fs";

// init dot env
dotenv.config();

(async () => {
  try {
    // TEST ALL SERVICES METHOD
    // const twService = new TwilioService();
    const geminiService = new GeminiService();
    const twService = new TwilioService();

    const query = "alumonabenaiah71@gmail.com";
    // const embedding = await geminiService.generateEmbedding(query);

    // // save embedding in .txt file
    // fs.writeFileSync(
    //   "embedding.txt",
    //   JSON.stringify(embedding.map((e) => e.embedding)[0])
    // );

    // console.log(await twService.getAvailableNumbersForPurchase());

    // console.log(await twService.retrievePhonePrice("US"));

    await twService.provisionPhoneNumber({
      subscription_id: "418084",
      user_id: "uL1PyCAkDiE6SvCvSwKrPi",
      phone_number: "+18582074861",
    });
  } catch (e: any) {
    console.log("\n", e, "\n");
  }
})();

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
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(
      bodyParser.json({
        // @ts-ignore
        // ( just so rawBody is available during WH validation)
        verify: (req: Request, res: Response, buf) => (req["rawBody"] = buf),
      })
    );
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
