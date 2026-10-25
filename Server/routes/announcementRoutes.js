const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');

router.use(protect);

router.get('/', getAnnouncements);
router.post('/', authorizeRoles('admin'), createAnnouncement);
router.put('/:id', authorizeRoles('admin'), updateAnnouncement);
router.delete('/:id', authorizeRoles('admin'), deleteAnnouncement);

module.exports = router;
