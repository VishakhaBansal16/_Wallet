import dotenv from "dotenv";
import jwt from "jsonwebtoken";
//import { User } from "../model/user.js";
export const verifyToken = async (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-auth-token"];
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    jwt.verify(token, process.env.TOKEN_KEY, (err, payload) => {
      if (err) {
        return next(createError.Unauthorised());
      }
      req.payload = payload;

      next();
    });
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
};
