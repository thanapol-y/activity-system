import express from 'express';
import {
  createActivity,
  getAllActivities,
  getActivityById,
  getActivityTypes,
  updateActivity,
  deleteActivity,
  approveActivity,
  rejectActivity,
  getActivityRegistrations,
  assignClubToActivity,
  getAssignedClubs,
} from '../controllers/activityController';
import {
  authenticate,
  isDean,
  isActivityHead,
  isActivityHeadOrDean,
  isClubOrActivityHead,
  optionalAuth,
} from '../middleware/auth';

const router = express.Router();

/**
 * @route   GET /api/activities/types
 * @desc    Get all activity types
 * @access  Public
 */
router.get('/types', getActivityTypes);

/**
 * @route   POST /api/activities
 * @desc    Create new activity
 * @access  Private (Activity Head only)
 */
router.post('/', authenticate, isActivityHead, createActivity);

/**
 * @route   GET /api/activities
 * @desc    Get all activities (with filters)
 * @access  Public/Private (filtered by role)
 */
router.get('/', optionalAuth, getAllActivities);

/**
 * @route   GET /api/activities/:id
 * @desc    Get activity by ID
 * @access  Public
 */
router.get('/:id', getActivityById);

/**
 * @route   PUT /api/activities/:id
 * @desc    Update activity
 * @access  Private (Activity Head - own activities only)
 */
router.put('/:id', authenticate, isActivityHead, updateActivity);

/**
 * @route   DELETE /api/activities/:id
 * @desc    Delete activity
 * @access  Private (Activity Head - own activities only)
 */
router.delete('/:id', authenticate, isActivityHead, deleteActivity);

/**
 * @route   POST /api/activities/:id/approve
 * @desc    Approve activity
 * @access  Private (Dean only)
 */
router.post('/:id/approve', authenticate, isDean, approveActivity);

/**
 * @route   POST /api/activities/:id/reject
 * @desc    Reject activity
 * @access  Private (Dean only)
 */
router.post('/:id/reject', authenticate, isDean, rejectActivity);

/**
 * @route   GET /api/activities/:id/registrations
 * @desc    Get activity registrations
 * @access  Private (Activity Head, Club)
 */
router.get('/:id/registrations', authenticate, isClubOrActivityHead, getActivityRegistrations);

/**
 * @route   POST /api/activities/:id/assign-club
 * @desc    Assign club to activity
 * @access  Private (Activity Head only)
 */
router.post('/:id/assign-club', authenticate, isActivityHead, assignClubToActivity);

/**
 * @route   GET /api/activities/:id/assigned-clubs
 * @desc    Get assigned clubs for activity
 * @access  Private (Activity Head, Club)
 */
router.get('/:id/assigned-clubs', authenticate, isClubOrActivityHead, getAssignedClubs);

export default router;
