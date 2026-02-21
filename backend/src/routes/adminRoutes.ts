import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
  getDashboardStats,
} from '../controllers/adminController';
import {
  getTables,
  getTableData,
  updateRow,
  deleteRow,
  executeQuery,
} from '../controllers/databaseController';

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticate, isAdmin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getUsers);
router.get('/users/:role/:id', getUser);
router.post('/users/:role', createUser);
router.put('/users/:role/:id', updateUser);
router.delete('/users/:role/:id', deleteUser);
router.put('/users/:role/:id/reset-password', resetPassword);

// Database management
router.get('/database/tables', getTables);
router.get('/database/tables/:table', getTableData);
router.put('/database/tables/:table', updateRow);
router.delete('/database/tables/:table', deleteRow);
router.post('/database/query', executeQuery);

export default router;
