const Training = require('../models/Training');
const User = require('../models/User');

// @desc    Get all training programs with current user enrollment status
// @route   GET /api/trainings
// @access  Private
exports.getAllTrainings = async (req, res) => {
  try {
    const { category, status } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const trainings = await Training.find(query)
      .populate('createdBy', 'firstName lastName designation')
      .populate('enrolledEmployees.employee', 'firstName lastName employeeId department designation avatar')
      .sort({ startDate: 1 });

    // Enhance each training with user-specific enrollment flag
    const formatted = trainings.map(t => {
      const obj = t.toObject();
      const myEnrollment = obj.enrolledEmployees.find(
        e => e.employee && e.employee._id.toString() === req.user._id.toString()
      );
      return {
        ...obj,
        isEnrolled: Boolean(myEnrollment),
        myProgress: myEnrollment ? myEnrollment.progress : 0,
        myStatus: myEnrollment ? myEnrollment.status : null,
        enrolledCount: obj.enrolledEmployees.length
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      trainings: formatted
    });
  } catch (err) {
    console.error('getAllTrainings error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve training courses.',
      error: err.message
    });
  }
};

// @desc    Get single training program
// @route   GET /api/trainings/:id
// @access  Private
exports.getTrainingById = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id)
      .populate('createdBy', 'firstName lastName designation')
      .populate('enrolledEmployees.employee', 'firstName lastName employeeId department designation avatar');

    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found.'
      });
    }

    res.status(200).json({
      success: true,
      training
    });
  } catch (err) {
    console.error('getTrainingById error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve training details.',
      error: err.message
    });
  }
};

// @desc    Create a new training program
// @route   POST /api/trainings
// @access  Private (Admin & Manager)
exports.createTraining = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      trainer,
      startDate,
      endDate,
      durationHours,
      status,
      targetDepartment
    } = req.body;

    if (!title || !description || !trainer || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, trainer, start date, and end date are required.'
      });
    }

    const newTraining = new Training({
      title: title.trim(),
      description: description.trim(),
      category: category || 'Technical Skills',
      trainer: trainer.trim(),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      durationHours: durationHours ? Number(durationHours) : 10,
      status: status || 'Upcoming',
      targetDepartment: targetDepartment || 'All',
      createdBy: req.user._id,
      enrolledEmployees: []
    });

    await newTraining.save();

    res.status(201).json({
      success: true,
      message: 'Training program created successfully.',
      training: newTraining
    });
  } catch (err) {
    console.error('createTraining error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create training program.',
      error: err.message
    });
  }
};

// @desc    Update a training program
// @route   PUT /api/trainings/:id
// @access  Private (Admin & Manager)
exports.updateTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found.'
      });
    }

    const {
      title,
      description,
      category,
      trainer,
      startDate,
      endDate,
      durationHours,
      status,
      targetDepartment
    } = req.body;

    if (title) training.title = title.trim();
    if (description) training.description = description.trim();
    if (category) training.category = category;
    if (trainer) training.trainer = trainer.trim();
    if (startDate) training.startDate = new Date(startDate);
    if (endDate) training.endDate = new Date(endDate);
    if (durationHours !== undefined) training.durationHours = Number(durationHours);
    if (status) training.status = status;
    if (targetDepartment) training.targetDepartment = targetDepartment;

    await training.save();

    res.status(200).json({
      success: true,
      message: 'Training program updated successfully.',
      training
    });
  } catch (err) {
    console.error('updateTraining error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update training program.',
      error: err.message
    });
  }
};

// @desc    Delete training program
// @route   DELETE /api/trainings/:id
// @access  Private (Admin only)
exports.deleteTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found.'
      });
    }

    await Training.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Training program deleted successfully.'
    });
  } catch (err) {
    console.error('deleteTraining error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete training program.',
      error: err.message
    });
  }
};

// @desc    Enroll logged in user in training
// @route   POST /api/trainings/:id/enroll
// @access  Private (All roles)
exports.enrollInTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found.'
      });
    }

    const userId = req.body.employeeId || req.user._id;

    // Check if already enrolled
    const isEnrolled = training.enrolledEmployees.some(
      e => e.employee.toString() === userId.toString()
    );

    if (isEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'Employee is already enrolled in this training program.'
      });
    }

    training.enrolledEmployees.push({
      employee: userId,
      enrolledAt: new Date(),
      status: 'Enrolled',
      progress: 0
    });

    await training.save();

    res.status(200).json({
      success: true,
      message: 'Successfully enrolled in training program!',
      training
    });
  } catch (err) {
    console.error('enrollInTraining error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to enroll in training.',
      error: err.message
    });
  }
};

// @desc    Update progress in training program
// @route   PUT /api/trainings/:id/progress
// @access  Private
exports.updateProgress = async (req, res) => {
  try {
    const { progress, feedback } = req.body;
    const training = await Training.findById(req.params.id);

    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found.'
      });
    }

    const enrollment = training.enrolledEmployees.find(
      e => e.employee.toString() === req.user._id.toString()
    );

    if (!enrollment) {
      return res.status(400).json({
        success: false,
        message: 'You are not enrolled in this training.'
      });
    }

    if (progress !== undefined) {
      const numProgress = Math.min(100, Math.max(0, Number(progress)));
      enrollment.progress = numProgress;

      if (numProgress === 100) {
        enrollment.status = 'Completed';
        enrollment.completedAt = new Date();
      } else if (numProgress > 0) {
        enrollment.status = 'In Progress';
      }
    }

    if (feedback !== undefined) {
      enrollment.feedback = feedback;
    }

    await training.save();

    res.status(200).json({
      success: true,
      message: 'Training progress updated successfully.',
      enrollment
    });
  } catch (err) {
    console.error('updateProgress error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update training progress.',
      error: err.message
    });
  }
};
