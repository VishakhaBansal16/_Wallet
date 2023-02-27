import express from 'express';
import {transaction, sentTransactionDetails, receivedTransactionDetails} from '../controllers/transactionController.js';
import {verifyToken} from '../middleware/auth.js';
export const txn_route = express.Router();

txn_route.route("/transaction").post(verifyToken, transaction);
txn_route.route("/sentTransactionDetails").get(verifyToken, sentTransactionDetails);
txn_route.route("/receivedTransactionDetails").get(verifyToken, receivedTransactionDetails);
