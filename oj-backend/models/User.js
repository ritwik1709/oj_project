import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
  
    passwordHash: {
      type: String,
      required: true,
    },
  
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  }, { timestamps: true });
  
const User = mongoose.model("User", userSchema)

export default User;
