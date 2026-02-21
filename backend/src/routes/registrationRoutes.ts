import express from 'express';
import {
  registerForActivity,
  cancelRegistration,
  getMyRegistrations,
  getQRCode,
  getCheckInStatus,
  checkInWithQRCode,
  getCheckInHistory,
  getActivityHistory,
} from '../controllers/registrationController';
import {
  authenticate,
  isStudent,
  isClub,
} from '../middleware/auth';

const router = express.Router();

/**
 * @route   POST /api/registrations/register
 * @desc    Register student for activity
 * @access  Private (Student only)
 */
router.post('/register', authenticate, isStudent, registerForActivity);

/**
 * @route   POST /api/registrations/cancel
 * @desc    Cancel registration
 * @access  Private (Student only)
 */
router.post('/cancel', authenticate, isStudent, cancelRegistration);

/**
 * @route   GET /api/registrations/my
 * @desc    Get student's registrations
 * @access  Private (Student only)
 */
router.get('/my', authenticate, isStudent, getMyRegistrations);

/**
 * @route   GET /api/registrations/qr/:activityId
 * @desc    Get QR code for specific registration
 * @access  Private (Student only)
 */
router.get('/qr/:activityId', authenticate, isStudent, getQRCode);

/**
 * @route   GET /api/registrations/checkin-status/:activityId
 * @desc    Check if student has been checked in for an activity (for polling)
 * @access  Private (Student only)
 */
router.get('/checkin-status/:activityId', authenticate, isStudent, getCheckInStatus);

/**
 * @route   POST /api/registrations/checkin
 * @desc    Check-in student with QR code
 * @access  Private (Club only)
 */
router.post('/checkin', authenticate, isClub, checkInWithQRCode);

/**
 * @route   GET /api/registrations/checkin-history/:activityId
 * @desc    Get check-in history for activity
 * @access  Private (Club only)
 */
router.get('/checkin-history/:activityId', authenticate, isClub, getCheckInHistory);

/**
 * @route   GET /api/registrations/history
 * @desc    Get student's activity history
 * @access  Private (Student only)
 */
router.get('/history', authenticate, isStudent, getActivityHistory);

export default router;
