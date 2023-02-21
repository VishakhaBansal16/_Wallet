import mongoose from 'mongoose';

const transactionSchema =new mongoose.Schema(
  {
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    transactionId: {type: Number, trim: true}, //using trim white spaces will be removed from both sides of string
    email: {type: String, required: [true, "email is required"], trim: true},
    amount: {type: Number, required: [true, "amount is required"]},
    paymentStatus: {type: String, enum: ["successful", "pending", "failed"], default: "pending"}
    // add address 
  },
  {
    timestamps: true,
  }
);

export const Transaction = mongoose.model("Transaction", transactionSchema);