import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true,
    minlength: [3, "Full name must be at least 3 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Invalid email format"],
  },
  securityCode: {
    type: String,
    required: [true, "Security code is required"],
    minlength: [6, "Security code must be at least 6 characters"],
  },
}, { timestamps: true });

const Account = mongoose.model("Account", accountSchema);
export default Account;
