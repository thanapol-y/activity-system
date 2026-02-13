import express from 'express';
import {
  getOverallStatistics,
  getActivityStatistics,
  getDeanApprovalHistory,
  getActivityHeadStatistics,
  getClubStatistics,
} from '../controllers/statisticsController';
import {
  authenticate,
  isDean,
  isActivityHead,
  isClub,
  isActivityHeadOrDean,
} from '../middleware/auth';

const router = express.Router();

/**
 * @route   GET /api/statistics/overall
 * @desc    Get overall statistics (Dean dashboard)
 * @access  Private (Dean only)
 */
router.get('/overall', authenticate, isDean, getOverallStatistics);

/**
 * @route   GET /api/statistics/activity/:id
 * @desc    Get statistics for specific activity
 * @access  Private (Activity Head, Dean)
 */
router.get('/activity/:id', authenticate, isActivityHeadOrDean, getActivityStatistics);

/**
 * @route   GET /api/statistics/dean/approval-history
 * @desc    Get dean's approval history
 * @access  Private (Dean only)
 */
router.get('/dean/approval-history', authenticate, isDean, getDeanApprovalHistory);

/**
 * @route   GET /api/statistics/activity-head
 * @desc    Get activity head statistics
 * @access  Private (Activity Head only)
 */
router.get('/activity-head', authenticate, isActivityHead, getActivityHeadStatistics);

/**
 * @route   GET /api/statistics/club
 * @desc    Get club statistics
 * @access  Private (Club only)
 */
router.get('/club', authenticate, isClub, getClubStatistics);

export default router;
