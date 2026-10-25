const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getTodayAttendance,
  getMyAttendanceHistory,
  getAllAttendance,
  manualAttendance
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');

router.use(protect);

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/today', getTodayAttendance);
router.get('/my-history', getMyAttendanceHistory);
router.get('/', authorizeRoles('admin', 'manager'), getAllAttendance);
router.post('/manual', authorizeRoles('admin'), manualAttendance);

module.exports = router;
