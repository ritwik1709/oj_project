import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined in environment variables');
}

// Register
export const register = async (req, res) => {
  try {
    const { username, email, password, adminCode } = req.body;
    console.log("Received body:", { username, email, adminCode });
    console.log("Environment ADMIN_SECRET_CODE:", process.env.ADMIN_SECRET_CODE);
    console.log("Received adminCode:", adminCode);

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    console.log("Existing user:", existingUser);

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Check for admin code
    const role = adminCode === process.env.ADMIN_SECRET_CODE ? "admin" : "user";
    console.log("Admin code comparison:", {
      received: adminCode,
      expected: process.env.ADMIN_SECRET_CODE,
      matches: adminCode === process.env.ADMIN_SECRET_CODE,
      assignedRole: role
    });

    const newUser = new User({
      username,
      email,
      passwordHash,
      role
    });

    await newUser.save();
    console.log("New user created:", { username, email, role });

    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ 
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error("❌ Error in register route:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login
export const login = async (req, res) => {
  try {
    console.log("👉 Login attempt - Request body:", req.body);
    const { email, password } = req.body;

    console.log("🔍 Searching for user with email:", email);
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log("❌ User not found with email:", email);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log("✅ User found, comparing passwords");
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    
    if (!isMatch) {
      console.log("❌ Password does not match");
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log("✅ Password matched, generating token");
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log("✅ Login successful for user:", {
      id: user._id,
      username: user.username,
      role: user.role
    });

    res.json({ 
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    console.error("❌ Error in login route:", err);
    res.status(500).json({ message: 'Server error' });
  }
};
