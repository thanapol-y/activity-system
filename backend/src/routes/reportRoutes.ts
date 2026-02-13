import express from 'express';
import {
  createReport,
  getReportsForActivityHead,
  updateReportStatus,
  getMyReports,
  getGenders,
} from '../controllers/reportController';
import { authenticate, isClub, isActivityHead } from '../middleware/auth';

const router = express.Router();

// Public
router.get('/genders', getGenders);

// Club routes
router.post('/', authenticate, isClub, createReport);
router.get('/my', authenticate, isClub, getMyReports);

// Activity Head routes
router.get('/activity-head', authenticate, isActivityHead, getReportsForActivityHead);
router.put('/:id/status', authenticate, isActivityHead, updateReportStatus);

export default router;
