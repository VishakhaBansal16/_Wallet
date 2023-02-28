import dotenv from "dotenv/config";
import createError from "http-errors";
//dotenv.config({ path: "./.env" });
//const config = process.env;
import { db } from "./db/database.js";
import mongoose from "mongoose";
import express from "express";
import { user_route } from "./routes/userRoute.js";
import { transaction_route } from "./routes/transactionRoute.js";
const app = express();
const port = process.env.API_PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api/user", user_route);
app.use("/api/transaction", transaction_route);

app.use((req, res, next) => {
  next(createError(404, "Not Found"));
});

//error handler
app.use((err, req, res, next) => {
  //set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.status(404).json({
    status: "failed",
    message: "Page not found",
  });
  res.status(500).json({
    status: "failed",
    message: "Internal server error",
  });
});

// server listening
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
