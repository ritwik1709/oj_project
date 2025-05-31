import express from 'express';
import { register, login } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify', authMiddleware, (req, res) => {
  // If authMiddleware passes, token is valid
  res.json({ valid: true });
});

export default router;
