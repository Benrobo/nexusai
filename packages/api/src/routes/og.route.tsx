import express from "express";
import useCatchErrors from "../lib/error";
import UserController from "../controller/user.controller";
import {
  loadAllOgFonts,
  loadCustomFont,
  loadLocalImage,
  loadMeshBg,
} from "@snapx/shared/lib/og-utils";
import { Request, Response } from "express";
import env from "../config/env";
import ImageResponse from "../lib/satori";
import getOgTemplate from "../lib/getOgTemplate";
import OpenGraphImageGeneration from "../services/og-generation.service";

export default class OgRoute {
  router = express.Router();
  userController = new UserController();
  path = "/og";

  constructor() {
    this.initializeRoutes();
  }

  async initializeRoutes() {
    const { ppReg, ppBold, ppEB, ppMed, rubikMono } = await loadAllOgFonts(
      env.CLIENT_URL
    );
    const internalLogo = await loadLocalImage({
      base_url: env.CLIENT_URL,
      type: "logo",
    });
    const OG_WIDTH = 1200;
    const OG_HEIGHT = 600;
    const ogFonts = [
      {
        name: "--poppins-regular",
        data: ppReg!,
        style: "normal",
      },
      {
        name: "--poppins-bold",
        data: ppBold!,
        style: "normal",
      },
      {
        name: "--poppins-extrabold",
        data: ppEB!,
        style: "normal",
      },
      {
        name: "--rubik-mono",
        data: rubikMono!,
        style: "normal",
      },
    ] as any;

    // Aurora Og Template
    this.router.get(
      `${this.path}/aurora`,
      useCatchErrors(async (req: Request, res: Response) => {
        const data = await OpenGraphImageGeneration.generateImage(req);
        const meshBgImage = await loadMeshBg(
          data?.frame_bg_name,
          env.CLIENT_URL
        );

        const { buffer } = await ImageResponse({
          node: getOgTemplate({
            template_id: "aurora",
            internal_logo: internalLogo,
            data,
            meshBgImage,
          }),
          width: OG_WIDTH,
          height: OG_HEIGHT,
          fonts: ogFonts,
        });

        res.setHeader("Content-Type", "image/jpeg");
        res.status(200).send(buffer);
      })
    );

    // Blogr Og Templates
    this.router.get(
      `${this.path}/blogr`,
      useCatchErrors(async (req: Request, res: Response) => {
        const data = await OpenGraphImageGeneration.generateImage(req);
        const meshBgImage = await loadMeshBg(
          data?.frame_bg_name,
          env.CLIENT_URL
        );
        const avatar = await loadLocalImage({
          base_url: env.CLIENT_URL,
          type: "avatar",
        });

        const { buffer } = await ImageResponse({
          node: getOgTemplate({
            template_id: "blogr",
            internal_logo: internalLogo,
            data,
            meshBgImage,
            avatar,
          }),
          width: OG_WIDTH,
          height: OG_HEIGHT,
          fonts: ogFonts,
        });

        res.setHeader("Content-Type", "image/jpeg");
        res.status(200).send(buffer);
      })
    );

    // JustLogo Template
    this.router.get(
      `${this.path}/justLogo`,
      useCatchErrors(async (req: Request, res: Response) => {
        const data = await OpenGraphImageGeneration.generateImage(req);
        const meshBgImage = await loadMeshBg(
          data?.frame_bg_name,
          env.CLIENT_URL
        );

        const { buffer } = await ImageResponse({
          node: getOgTemplate({
            template_id: "justLogo",
            internal_logo: internalLogo,
            data,
            meshBgImage,
          }),
          width: OG_WIDTH,
          height: OG_HEIGHT,
          fonts: ogFonts,
        });

        res.setHeader("Content-Type", "image/jpeg");
        res.status(200).send(buffer);
      })
    );

    // Pitch Template
    this.router.get(
      `${this.path}/pitch`,
      useCatchErrors(async (req: Request, res: Response) => {
        const data = await OpenGraphImageGeneration.generateImage(req);
        const meshBgImage = await loadMeshBg(
          data?.frame_bg_name,
          env.CLIENT_URL
        );
        const pitchBanner = await loadLocalImage({
          base_url: env.CLIENT_URL,
          type: "pitch-mockup",
        });
        const pitchLogo = await loadLocalImage({
          base_url: env.CLIENT_URL,
          type: "pitch-logo",
        });

        const { buffer } = await ImageResponse({
          node: getOgTemplate({
            template_id: "pitch",
            internal_logo: internalLogo,
            data,
            meshBgImage,
            pitch: {
              banner: pitchBanner,
              logo: pitchLogo,
            },
          }),
          width: OG_WIDTH,
          height: OG_HEIGHT,
          fonts: ogFonts,
        });

        res.setHeader("Content-Type", "image/jpeg");
        res.status(200).send(buffer);
      })
    );
  }
}
