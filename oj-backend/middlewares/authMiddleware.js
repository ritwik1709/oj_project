import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined in environment variables');
}

export const authMiddleware = (req, res, next) => {
  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers.authorization;
    console.log('Auth Middleware - Headers:', {
      authorization: authHeader ? `${authHeader.substring(0, 20)}...` : 'none'
    });

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Auth Middleware - No valid Authorization header');
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(" ")[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Auth Middleware - Decoded token:', {
        userId: decoded.userId,
        role: decoded.role
      });

      // Set user info in request
      req.user = {
        id: decoded.userId,
        role: decoded.role
      };

      next();
    } catch (jwtError) {
      console.error('Auth Middleware - JWT verification failed:', jwtError.message);
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth Middleware - Unexpected error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/*
This is a JWT (JSON Web Token) authentication middleware that protects routes in your application by verifying if the user is authenticated.
*/