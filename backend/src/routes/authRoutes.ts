import express from 'express';
import {
  login,
  getProfile,
  registerStudent,
  changePassword,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login user (all roles)
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/register/student
 * @desc    Register new student
 * @access  Public
 */
router.post('/register/student', registerStudent);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, getProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', authenticate, changePassword);

export default router;
