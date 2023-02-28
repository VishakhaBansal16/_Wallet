import dotenv from "dotenv/config";
import { User } from "../model/user.js";
import { Transaction } from "../model/transaction.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Accounts from "web3-eth-accounts";
import Web3 from "web3";
import { sendConfirmationEmail } from "../nodemailer.js";
import { initMint, init, initBalance } from "../scripts.js";
import createError from "http-errors";
const accounts = new Accounts(
  "https://goerli.infura.io/v3/73278735c19b4cd7bc5ea172332ca2f9"
);
export const registerUser = async (req, res, next) => {
  try {
    // Get user input
    const { first_name, last_name, email, password, role } = req.body;
    console.log(req.body);
    // Validate user input
    if (!(email && password && first_name && last_name && role)) {
      res.status(400).json({
        status: "failed",
        message: "All inputs are required",
      });
    }

    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).json({
        status: "failed",
        message: "All inputs are required",
      });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const web3 = new Web3();
    const account = web3.eth.accounts.create(); //returns address and private key

    const encryptedData = web3.eth.accounts.encrypt(
      account.privateKey,
      process.env.secretkey
    );

    // Create user in our database
    const user = await User.create({
      first_name,
      last_name,
      email: email.toLowerCase(),
      password: encryptedPassword,
      address: account.address,
      private_key: encryptedData,
      role,
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    // save user token
    user.token = token;

    if (!user) {
      throw createError(404, "Not Found");
    }

    // return new user
    res.status(201).json({
      status: "success",
      user,
    });

    sendConfirmationEmail(user.first_name, user.email, user._id);

    const amount = 100000000000000000000n;
    const _address = process.env.contractOwnerAddress;
    const _privateKey = process.env.contractOwnerPrivateKey;

    //minting 100 tokens to contractOwner
    const receipt = await initMint(_address, _privateKey, amount);

    //transferring 100 tokens from contractOwner to new user
    const Receipt = await init(_address, _privateKey, user.address, amount);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const verifyUserEmail = async (req, res) => {
  await User.updateOne({ _id: req.params.id }, { $set: { status: "Active" } });
  res.send("Email has been verified successfully");
};

export const loginUser = async (req, res, next) => {
  try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }

    // Validate if user exist in our database
    const user = await User.findOne({ email });

    if (user && bcrypt.compare(password, user.password)) {
      //validate if user email is verified
      if (user.status != "Active") {
        return res.status(401).send("Please verify your email!");
      } else {
        // Create token
        const token = jwt.sign(
          { user_id: user._id, email },
          process.env.TOKEN_KEY,
          {
            expiresIn: "2h",
          }
        );

        // save user token
        user.token = token;

        if (!user) {
          throw createError(404, "Not Found");
        }
        // user
        res.status(201).json({
          status: "success",
          user,
        });
      }
    } else {
      res.status(400).send("Invalid Credentials");
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const balance = async (req, res, next) => {
  const id = req.payload.user_id;
  try {
    const user = await User.findOne({ _id: id });
    const Balance = await initBalance(user.address); //initBalance(address) will call balanceOf(address) of deployed contract from scripts.js
    if (!Balance) {
      throw createError(404, "Not Found");
    }
    res.status(200).json({
      status: "success",
      Balance,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};
