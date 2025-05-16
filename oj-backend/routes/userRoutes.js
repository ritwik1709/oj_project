import express from 'express';
import { getAllUsers, updateUserRole, deleteUser } from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';

const router = express.Router();

// All routes are admin-protected
router.use(authMiddleware, adminMiddleware);

router.get('/', getAllUsers);
router.patch('/:id', updateUserRole);
router.delete('/:id', deleteUser);

export default router; 