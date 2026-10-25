const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  getTeamLeaves,
  reviewLeave,
  cancelLeave
} = require('../controllers/leaveController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');

router.use(protect);

router.post('/', applyLeave);
router.get('/my-leaves', getMyLeaves);
router.get('/team-leaves', authorizeRoles('manager', 'admin'), getTeamLeaves);
router.get('/', authorizeRoles('admin'), getAllLeaves);
router.put('/:id/review', authorizeRoles('admin', 'manager'), reviewLeave);
router.put('/:id/cancel', cancelLeave);

module.exports = router;
