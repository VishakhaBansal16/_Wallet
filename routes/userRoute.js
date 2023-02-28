import express from "express";
import {
  registerUser,
  verifyUserEmail,
  loginUser,
  balance,
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/auth.js";
export const user_route = express.Router();

user_route.route("/register").post(registerUser);
user_route.route("/verifyEmail/:id").get(verifyUserEmail);
user_route.route("/login").post(loginUser);
user_route.route("/checkBalance").get(verifyToken, balance);
