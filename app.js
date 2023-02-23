import dotenv from 'dotenv/config';
import {User} from './model/user.js';
import {Transaction} from './model/transaction.js';
import {db} from './config/database.js';
import mongoose from 'mongoose';
import http from 'http';
import express from 'express'; 
import bcrypt from 'bcryptjs';
export const app = express();
import jwt from 'jsonwebtoken';
import {verifyToken} from './middleware/auth.js';
import Accounts from 'web3-eth-accounts';
import Web3 from 'web3';
import nodemailer from 'nodemailer';
import {sendConfirmationEmail} from './nodemailer.js';
import {init} from './scripts.js';
const accounts = new Accounts('ws://localhost:8080');
app.use(express.json());
import {sendTransactionEmail} from './nodemailer.js';

// User Registration route
app.post("/register", async (req, res) => {
    try {
        
      // Get user input
        const { first_name, last_name, email, password, role} = req.body;
    
        // Validate user input
        if (!(email && password && first_name && last_name && role)) {
          res.status(400).send("All input is required");
        }

        const oldUser = await User.findOne({ email });

       if (oldUser) {
          return res.status(409).send("User Already Exist. Please Login");
       }
       
       const encryptedPassword = await bcrypt.hash(password, 10);
       
       const web3 = new Web3();
       const a = web3.eth.accounts.create(); //returns address and private key
       
        const encryptedData = web3.eth.accounts.encrypt(a.privateKey, process.env.secretkey);
        
        // Create user in our database
        const user = await User.create({
          first_name,
          last_name,
          email: email.toLowerCase(),
          password: encryptedPassword,
          address: a.address, 
          private_key: encryptedData,
          role
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
    
        // return new user
        res.status(201).json(user);

       sendConfirmationEmail(
        user.first_name,
        user.email,
        user._id
       );
        
      } catch (err) {
        console.log(err);
      }
});

// Email Verification route
app.get("/verifyEmail/:id", async (req, res) => {
  await User.updateOne( { _id: req.params.id }, { $set: { status: "Active" } } );
  res.send("Email has been verified successfully");
});

// User Login route
app.post("/login", async (req, res) => {
    try {
        // Get user input
        const { email, password } = req.body;
    
        // Validate user input
        if (!(email && password)) {
          res.status(400).send("All input is required");
        }
        
        // Validate if user exist in our database
        const user = await User.findOne({ email });
        
       //validate if user email is verified 
        if (user.status != "Active") {
           return res.status(401).send("Please verify your email!");
        }

        if (user.email === email && (bcrypt.compare(password, user.password))) {
          
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
    
          // user
          res.status(201).json(user);
        }
        else{
          res.status(400).send("Invalid Credentials");
        }
      } catch (err) {
        console.log(err);
        }
});

app.post("/welcome", verifyToken, (req, res) => {
  res.status(200).send("Welcome");
});

//Transaction Route
app.post("/transaction", async (req, res) => {
  try{
     //Get user input
     const {email, to, amount} = req.body;
     if(!(email, to, amount)){
       res.status(400).send("All input is required");
     }
     const user=await User.findOne({email});
     const decryptedData = accounts.decrypt(user.private_key, process.env.secretKey);
     const Receipt = await init(user.address, decryptedData.privateKey, to, amount);
     console.log(Receipt);
     var txnStatus = "";
     if(Receipt.status){
      txnStatus = 'successful';
     }
     else{
       txnStatus = 'failed';
     }
     
     //Create txn in database
     const txn = await Transaction.create({
      userId: user._id,
      email,
      address: user._address,
      transactionHash: Receipt.transactionHash,     
      transactionStatus: txnStatus
    });
   
    res.status(201).json(txn);
    
    sendTransactionEmail(
      user.first_name,
      txn.email,
      amount,
      txn.transactionStatus
    );
  
  }catch (err) {
        console.log(err);
      }
});

//Transaction details route
app.post("/transactionDetails", async (req, res) => {
  
  // Get user input
  const { email} = req.body;
 
  const user = await User.findOne({email});
  try{ 
    //transactions from user view
    if(user.role === 'User'){
     const userTransactions = await Transaction.find({userId: user._id});
     res.status(201).json(userTransactions);
    }
    //transactions from admin view
    if(user.role === 'Admin'){
     const allTransactions = await Transaction.find();
     res.status(201).json(allTransactions);
    }
  }catch (err) {
    console.log(err);
   }
});



