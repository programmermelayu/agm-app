import express from 'express';

const router = express.Router();

/**
 * Central route registry for the API
 * All routes will be mounted here
 * Example: router.use('/auth', authRoutes);
 */

// Auth routes (to be implemented in Phase 3)
// router.use('/auth', authRoutes);

// AGM routes (to be implemented in Phase 4)
// router.use('/agms', agmRoutes);

// Invitations routes (to be implemented in Phase 5)
// router.use('/invitations', invitationsRoutes);

// Attendance routes (to be implemented in Phase 6)
// router.use('/attendance', attendanceRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;
