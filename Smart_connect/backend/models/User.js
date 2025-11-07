// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  friends: [{ type: String }],
  profilePic: String,
  // socketId: { type: String, default: null },
  // isOnline: { type: Boolean, default: false },
  // lastSeen: { type: Date, default: Date.now },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: null },
  socketId: { type: String, default: null },
}, { timestamps: true });

export default mongoose.model("User", userSchema);


