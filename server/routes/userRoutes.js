import express from 'express';
import { registerUser, loginUser, getUserProfile } from '../controller/authController.js';
import { getStudents, updateStudentMarks, createUpdate, getUpdates, getSystemStats } from '../controller/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes (available to all logged-in roles)
router.get('/profile', protect, getUserProfile);
router.get('/updates', protect, getUpdates);

// Protected routes for staff (teachers, HODs, principals)
router.get('/students', protect, authorize('teacher', 'hod', 'principal'), getStudents);
router.post('/updates', protect, authorize('teacher', 'hod', 'principal'), createUpdate);

// Teacher-specific routes
router.put('/students/:id/marks', protect, authorize('teacher'), updateStudentMarks);

// HOD and Principal stats and reports routes
router.get('/stats', protect, authorize('hod', 'principal'), getSystemStats);

export default router;

//http://localhost:5000/api/users/register