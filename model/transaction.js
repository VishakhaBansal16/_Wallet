import mongoose from 'mongoose';

const transactionSchema =new mongoose.Schema(
  {
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    email: {type: String, required: [true, "email is required"], trim: true},
    transactionHash: {type: String},
    transactionStatus: {type: String, enum: ["successful", "failed", "pending"], default: "pending"},
    address: {type: String}
  },
  {
    timestamps: true,
  }
);

export const Transaction = mongoose.model("Transaction", transactionSchema);