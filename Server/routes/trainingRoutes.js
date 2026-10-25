const express = require('express');
const router = express.Router();
const {
  getAllTrainings,
  getTrainingById,
  createTraining,
  updateTraining,
  deleteTraining,
  enrollInTraining,
  updateProgress
} = require('../controllers/trainingController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');

router.use(protect);

router.get('/', getAllTrainings);
router.get('/:id', getTrainingById);
router.post('/', authorizeRoles('admin', 'manager'), createTraining);
router.put('/:id', authorizeRoles('admin', 'manager'), updateTraining);
router.delete('/:id', authorizeRoles('admin'), deleteTraining);
router.post('/:id/enroll', enrollInTraining);
router.put('/:id/progress', updateProgress);

module.exports = router;
