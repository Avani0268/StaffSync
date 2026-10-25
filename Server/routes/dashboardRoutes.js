const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getManagerDashboard,
  getEmployeeDashboard
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');

router.use(protect);

router.get('/admin', authorizeRoles('admin'), getAdminDashboard);
router.get('/manager', authorizeRoles('manager', 'admin'), getManagerDashboard);
router.get('/employee', getEmployeeDashboard);

module.exports = router;
