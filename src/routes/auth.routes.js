import { Router } from "express";
import passport from "passport";

import { AuthController } from "../controllers/auth.controllers.js";

const authRouter = Router();

authRouter.post(
  "/login",
  passport.authenticate("login", { session: false }),
  AuthController.login
);

authRouter.post(
  "/register",
  (req, res, next) => {
    passport.authenticate("register", { session: false }, (err, user, info) => {
      if (err) {
        return next(err); 
      }
      if (!user) {
        return res.status(400).json(info || { message: "Registration failed" });
      }
      req.user = user; 
      next(); 
    })(req, res, next);
  },
  
  AuthController.register
  
);


authRouter.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  AuthController.current
);

export default authRouter

