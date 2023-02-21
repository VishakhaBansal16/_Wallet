import dotenv from 'dotenv/config';
import {User} from './model/user.js';
import {db} from './config/database.js';
import express from 'express'; 
import mongoose from 'mongoose';
import http from 'http';
export const app = express();
import jwt from 'jsonwebtoken';
import {verifyToken} from './middleware/auth.js';
import {Transaction} from './model/transaction.js';
import Accounts from 'web3-eth-accounts';
import Web3 from 'web3';
import nodemailer from 'nodemailer';
import {sendConfirmationEmail} from './nodemailer.js';

// calling express.json() method for parsing incoming requests with JSON payloads 
// and this method only looks at the requests where the content-type header matches the type option
app.use(express.json());
const accounts = new Accounts('ws://localhost:8080');
       const web3 = new Web3();
// User Registration route
app.post("/register", async (req, res) => {
    try {
        // Get user input
        const { first_name, last_name, email, password} = req.body;
    
        // Validate user input
        if (!(email && password && first_name && last_name)) {
          res.status(400).send("All input is required");
        }

        const oldUser = await User.findOne({ email });

       if (oldUser) {
          return res.status(409).send("User Already Exist. Please Login");
       }

       
       const a = web3.eth.accounts.create();
       //console.log(`Private Key: \n${a.privateKey}`)
       //console.log(`Address: \n${a.address}`)
      
        const encryptedData = web3.eth.accounts.encrypt(a.privateKey, process.env.secretkey);
        
        // Create user in our database
        const user = await User.create({
          first_name,
          last_name,
          email: email.toLowerCase(), //convert email to lowercase
          password,
          address: a.address, 
          private_key: encryptedData
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
  console.log(req.params.id);
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
       // if (user.status != "Active") {
        //  return res.status(401).send("Please verify your email!");
       // }

       const decryptedData = accounts.decrypt(user.private_key, process.env.secretKey);
        console.log(decryptedData.privateKey);
    
        if (user.email === email && user.password===password) {
          
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

app.post("/pay", async (req, res) => {
  try{
     //Get user input
     const {name, email, amount} = req.body;
     if(!(name && email && amount)){
       res.status(400).send("All input is required");
     }

     //const user_Id = await User.findbyId({_id});
     const user_Id=await User.findOne({email});
     const txn = await Transaction.create({
      userId: user_Id._id,
      name,
      email,
      amount,
    });
    res.status(201).json(txn);
  }catch (err) {
        console.log(err);
      }
});



/*Save the token you get in localStorage after you do a post request on "/login"

Then while making a request on an api which requires authentication, do
axios.get(url, {headers: {"Authorization": <tokenSavedInLocalStorage> }})

Then in backend, you can get the token by using "req.header('Authorization')"*/
