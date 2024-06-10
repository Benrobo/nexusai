import express from "express";
import useCatchErrors from "../lib/error.js";
import UserController from "../controller/user.controller.js";
import AuthService from "../services/auth.service.js";

export default class AuthRoute {
  router = express.Router();
  userController = new UserController();
  authService = new AuthService();
  path = "/auth";

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    // login
    this.router.get(
      `${this.path}/google`,
      useCatchErrors(this.authService.googleAuth.bind(this.authService))
    );

    // handle google callback
    this.router.get(
      `${this.path}/google/callback`,
      useCatchErrors(this.authService.googleAuthCallback.bind(this.authService))
    );

    // logout
    this.router.get(
      `${this.path}/logout`,
      useCatchErrors(this.authService.logout.bind(this.authService))
    );
  }
}
