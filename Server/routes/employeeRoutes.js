const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getTeamMembers
} = require('../controllers/employeeController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');

router.use(protect);

router.get('/team/members', authorizeRoles('manager', 'admin'), getTeamMembers);
router.get('/', authorizeRoles('admin', 'manager'), getAllEmployees);
router.get('/:id', getEmployeeById);
router.post('/', authorizeRoles('admin'), createEmployee);
router.put('/:id', authorizeRoles('admin'), updateEmployee);
router.delete('/:id', authorizeRoles('admin'), deleteEmployee);

module.exports = router;
