import {User} from '../model/user.js';
import {Transaction} from '../model/transaction.js';
import Accounts from 'web3-eth-accounts';
import {init} from '../scripts.js';
import {sendTransactionEmail} from '../nodemailer.js';

const accounts = new Accounts('ws://localhost:8080'); 

export const transaction = async (req, res) => {
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
  };

export const sentTransactionDetails = async (req, res) => {
  
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
};

export const receivedTransactionDetails =  async (req, res) => {
  
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
};
