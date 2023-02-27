import dotenv from 'dotenv/config';      
import {db} from './config/database.js';
import mongoose from 'mongoose';
  import express from 'express';
import {user_route} from './routes/userRoute.js';
import {txn_route} from './routes/transactionRoute.js';

const app = express();
const { API_PORT } = process.env;
const port = process.env.PORT || API_PORT;
 
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use('/', user_route);
app.use('/', txn_route);

// server listening 
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});