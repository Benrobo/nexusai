import express from "express";
import useCatchErrors from "../lib/error";
import UserController from "../controller/user.controller";
import AuthService from "../services/auth.service";

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
    this.router.post(
      `${this.path}/login`,
      useCatchErrors(this.authService.login.bind(this.authService))
    );

    // otp auth
    this.router.post(
      `${this.path}/otp-auth`,
      useCatchErrors(this.authService.otpAuth.bind(this.authService))
    );
  }
}
