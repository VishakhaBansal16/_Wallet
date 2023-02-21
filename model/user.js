import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  first_name: { type: String, default: null },
  last_name: { type: String, default: null },
  email: { type: String, unique: true },// email should be unique
  password: { type: String },
  address: { type: String},
  private_key: {type: JSON},
  token: { type: String },
  status: {type: String, enum: ['Pending', 'Active'], default: 'Pending'}
});

export const User = mongoose.model("User", userSchema);