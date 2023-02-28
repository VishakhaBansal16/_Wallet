import { User } from "../model/user.js";
import { Transaction } from "../model/transaction.js";
import Accounts from "web3-eth-accounts";
import { init } from "../scripts.js";
import { sendTransactionEmail } from "../nodemailer.js";

const accounts = new Accounts(
  "https://goerli.infura.io/v3/73278735c19b4cd7bc5ea172332ca2f9"
);

export const transaction = async (req, res, next) => {
  try {
    //Get user input
    const { to, amount } = req.body;
    if (!(to, amount)) {
      res.status(400).json({
        status: "failed",
        message: "All inputs are required"
      });
    }
    const id = req.payload.user_id;
    const sender = await User.findOne({ _id: id });
    const decryptedData = accounts.decrypt(
      sender.private_key,
      process.env.secretKey
    );
    const Receipt = await init(
      sender.address,
      decryptedData.privateKey,
      to,
      amount
    );
    var txnStatus = "";
    if (Receipt.status) {
      txnStatus = "successful";
    } else {
      txnStatus = "failed";
    }
    const user = await User.findOne({ address: to });
    //Create txn in database
    const txn = await Transaction.create({
      userId: sender._id,
      email: sender.email,
      address: sender.address,
      transactionHash: Receipt.transactionHash,
      transactionStatus: txnStatus,
      to: to,
    });

     if(!txn){
      throw createHttpError(404, "Not Found");
     }
    res.status(201).json({
      status: "success",
      txn
    });

    sendTransactionEmail(
      sender.first_name,
      txn.email,
      amount,
      user.first_name,
      txn.transactionStatus
    );
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const sentTransactionDetails = async (req, res, next) => {
  // Get user input
  const id = req.payload.user_id;
  const user = await User.findOne({ _id: id });
  try {
    const sentTransactions = await Transaction.find({ userId: id });
    if (user.role === "User" && sentTransactions) {
      if(!sentTransactions){
        throw createHttpError(404, "Not Found");
      }

      res.status(201).json({
        status: "success",
        sentTransactions
      });
    }
    //transactions from admin view
    if (user.role === "Admin") {
      const allTransactions = await Transaction.find();
      if(!allTransactions){
        throw createHttpError(404, "Not Found");
      }
      res.status(201).json({
        status: "success",
        allTransactions
      });
    }
  }catch(err) {
    console.log(err);
    next(err);
  }
};

export const receivedTransactionDetails = async (req, res, next) => {
  // Get user input
  const id = req.payload.user_id;
  const user = await User.findOne({ _id: id });
  try {
    const receivedTransactions = await Transaction.find({ to: user.address });
    if(!receivedTransactions){
      throw createHttpError(404, "Not Found");
    }
    //transactions from user view
    if (user.role === "User" && receivedTransactions) {
      res.status(201).json({
        status: "success",
        receivedTransactions
      });
    }

    //transactions from admin view
    if (user.role === "Admin") {
      const allTransactions = await Transaction.find();
      if(!allTransactions){
        throw createHttpError(404, "Not Found");
      }
      res.status(201).json({
        status: "success",
        allTransactions
      });
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};
