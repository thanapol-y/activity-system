import express from 'express';
import authRoutes from './authRoutes';
import activityRoutes from './activityRoutes';
import registrationRoutes from './registrationRoutes';
import statisticsRoutes from './statisticsRoutes';
import adminRoutes from './adminRoutes';
import reportRoutes from './reportRoutes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/activities', activityRoutes);
router.use('/registrations', registrationRoutes);
router.use('/statistics', statisticsRoutes);
router.use('/admin', adminRoutes);
router.use('/reports', reportRoutes);

export default router;
