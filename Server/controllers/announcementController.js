const Announcement = require('../models/Announcement');

// @desc    Get all announcements relevant to logged-in user
// @route   GET /api/announcements
// @access  Private
exports.getAnnouncements = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};

    // Regular employees see 'All' or their specific department
    if (req.user.role === 'employee' || req.user.role === 'manager') {
      query.$or = [
        { targetDepartment: 'All' },
        { targetDepartment: req.user.department }
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { content: new RegExp(search, 'i') }
      ];
    }

    const announcements = await Announcement.find(query)
      .populate('author', 'firstName lastName designation role')
      .sort({ isPinned: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements
    });
  } catch (err) {
    console.error('getAnnouncements error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve announcements.',
      error: err.message
    });
  }
};

// @desc    Create a company announcement
// @route   POST /api/announcements
// @access  Private (Admin only)
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, category, priority, isPinned, targetDepartment } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required for announcement.'
      });
    }

    const newAnnouncement = new Announcement({
      title: title.trim(),
      content: content.trim(),
      category: category || 'General',
      priority: priority || 'medium',
      isPinned: Boolean(isPinned),
      targetDepartment: targetDepartment || 'All',
      author: req.user._id
    });

    await newAnnouncement.save();

    const populated = await Announcement.findById(newAnnouncement._id)
      .populate('author', 'firstName lastName designation role');

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully.',
      announcement: populated
    });
  } catch (err) {
    console.error('createAnnouncement error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create announcement.',
      error: err.message
    });
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Admin only)
exports.updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found.'
      });
    }

    const { title, content, category, priority, isPinned, targetDepartment } = req.body;

    if (title) announcement.title = title.trim();
    if (content) announcement.content = content.trim();
    if (category) announcement.category = category;
    if (priority) announcement.priority = priority;
    if (isPinned !== undefined) announcement.isPinned = Boolean(isPinned);
    if (targetDepartment) announcement.targetDepartment = targetDepartment;

    await announcement.save();

    const updated = await Announcement.findById(announcement._id)
      .populate('author', 'firstName lastName designation role');

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully.',
      announcement: updated
    });
  } catch (err) {
    console.error('updateAnnouncement error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update announcement.',
      error: err.message
    });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin only)
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found.'
      });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully.'
    });
  } catch (err) {
    console.error('deleteAnnouncement error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete announcement.',
      error: err.message
    });
  }
};
