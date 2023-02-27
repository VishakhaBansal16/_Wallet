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
import {init1} from './scripts.js';
import {init2} from './scripts.js';
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
      const amount = 100;
      const user1 = await User.findOne({role: "Admin"});
      const decryptedData1 = accounts.decrypt(user1.private_key, process.env.secretKey);
      const Receipt1 = await init1(user1.address, decryptedData1.privateKey, user.address, amount);
     var txnStatus = "";
     if(Receipt1.status){
      txnStatus = 'successful';
     }
     else{
       txnStatus = 'failed';
     }
     
     //Create txn in database
      const txn = await Transaction.create({
      userId: user1._id,
      email: user1.email,
      address: user1.address,
      transactionHash: Receipt1.transactionHash,     
      transactionStatus: txnStatus,
      to: user.address
     });
   }
      catch (err) {
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
        
        if (user && (bcrypt.compare(password, user.password))) {
          
          //validate if user email is verified
          if (user.status != "Active") {
             return res.status(401).send("Please verify your email!");
          }else{
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
        }
        else{
          res.status(400).send("Invalid Credentials");
        }
      } catch (err) {
        console.log(err);
        }
});

//Transaction Route
app.post("/transaction", verifyToken,  async (req, res) => {
  try{
      //Get user input
     const {to, amount} = req.body;
     if(!(to, amount)){
       res.status(400).send("All input is required");
     }

     const id = req.payload.user_id;
     const user1 = await User.findOne({ _id: id });
     const decryptedData = accounts.decrypt(user1.private_key, process.env.secretKey);
     const Receipt = await init(user1.address, decryptedData.privateKey, to, amount);
     var txnStatus = "";
     if(Receipt.status){
      txnStatus = 'successful';
     }
     else{
       txnStatus = 'failed';
     }
      const user = await User.findOne({address: to});
     //Create txn in database
      const txn = await Transaction.create({
      userId: user1._id,
      email: user1.email,
      address: user1.address,
      transactionHash: Receipt.transactionHash,     
      transactionStatus: txnStatus,
      to: to
    });
   
    res.status(201).json(txn);
    
    sendTransactionEmail(
      user1.first_name,
      txn.email,
      amount,
      user.first_name,
      txn.transactionStatus
    );
  
  }catch (err) {
        console.log(err);
      }
});

//Sent Transaction details route
app.get("/sentTransactionDetails", verifyToken, async (req, res) => {
  
  // Get user input
  const id = req.payload.user_id;
  const user1 = await User.findOne({ _id:id });
  try{ 
    const sentTransactions = await Transaction.find({userId: id});
    if(user1.role === 'User' && sentTransactions){
      res.status(201).json(sentTransactions);
    }
    
   //transactions from admin view
    else if(user1.role === 'Admin'){
     const allTransactions = await Transaction.find();
     res.status(201).json(allTransactions);
    }
  }catch(err){
     console.log(err);
  } 
}); 

//Sent Transaction details route
app.get("/sentTransactionDetails", verifyToken, async (req, res) => {
  
  // Get user input
  const id = req.payload.user_id;
  const user1 = await User.findOne({ _id:id });
  try{ 
    const sentTransactions = await Transaction.find({userId: id});
    if(user1.role === 'User' && sentTransactions){
      res.status(201).json(sentTransactions);
    }
    
   //transactions from admin view
    else if(user1.role === 'Admin'){
     const allTransactions = await Transaction.find();
     res.status(201).json(allTransactions);
    }
  }catch(err){
     console.log(err);
  } 
}); 

//Received Transactions route
app.get("/receivedTransactionDetails", verifyToken, async (req, res) => {
  
  // Get user input
  const id = req.payload.user_id;
  const user1 = await User.findOne({ _id:id });
  try{ 
    const receivedTransactions = await Transaction.find({to: user1.address});

    //transactions from user view
    if(user1.role === 'User' && receivedTransactions){
      res.status(201).json(receivedTransactions);
    }
    
   //transactions from admin view
    else if(user1.role === 'Admin'){
     const allTransactions = await Transaction.find();
     res.status(201).json(allTransactions);
    }
  }catch (err) {
    console.log(err);
   }
});

//Balance route
app.get("/checkBalance", verifyToken, async (req, res) => {
  const id = req.payload.user_id;
  const user = await User.findOne({ _id: id });
  const Balance = await init2(user.address);
  res.send(Balance);      
});



