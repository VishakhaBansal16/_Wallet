import express from 'express';
import {transaction, sentTransactionDetails, receivedTransactionDetails} from '../controllers/transactionController.js';
import {verifyToken} from '../middleware/auth.js';
export const transaction_route = express.Router();

transaction_route.route("/transaction").post(verifyToken, transaction);
transaction_route.route("/sentTransactionDetails").get(verifyToken, sentTransactionDetails);
transaction_route.route("/receivedTransactionDetails").get(verifyToken, receivedTransactionDetails);
