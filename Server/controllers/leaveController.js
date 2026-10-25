const Leave = require('../models/Leave');
const User = require('../models/User');

const mapLeaveTypeToKey = (type) => {
  if (type.includes('Annual')) return 'annual';
  if (type.includes('Casual')) return 'casual';
  if (type.includes('Sick')) return 'sick';
  return null;
};

// @desc    Apply for a leave request
// @route   POST /api/leaves
// @access  Private (All employees)
exports.applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Leave type, start date, end date, and reason are required.'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date.'
      });
    }

    // Calculate days count
    const diffTime = Math.abs(end - start);
    const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check user leave balance
    const user = await User.findById(req.user._id);
    const balanceKey = mapLeaveTypeToKey(leaveType);

    if (balanceKey && user.leaveBalances && user.leaveBalances[balanceKey] !== undefined) {
      if (user.leaveBalances[balanceKey] < daysCount) {
        return res.status(400).json({
          success: false,
          message: `Insufficient ${leaveType} balance. You have ${user.leaveBalances[balanceKey]} days remaining, but requested ${daysCount} days.`
        });
      }
    }

    const newLeave = new Leave({
      employee: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      daysCount,
      reason: reason.trim(),
      status: 'Pending'
    });

    await newLeave.save();

    const populated = await Leave.findById(newLeave._id)
      .populate('employee', 'firstName lastName employeeId department designation avatar');

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully.',
      leave: populated
    });
  } catch (err) {
    console.error('applyLeave error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to submit leave application.',
      error: err.message
    });
  }
};

// @desc    Get logged in user's leave requests
// @route   GET /api/leaves/my-leaves
// @access  Private
exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user._id })
      .populate('reviewedBy', 'firstName lastName designation')
      .sort({ createdAt: -1 });

    const user = await User.findById(req.user._id).select('leaveBalances');

    res.status(200).json({
      success: true,
      count: leaves.length,
      leaveBalances: user.leaveBalances,
      leaves
    });
  } catch (err) {
    console.error('getMyLeaves error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your leave records.',
      error: err.message
    });
  }
};

// @desc    Get all leave requests (Admin)
// @route   GET /api/leaves
// @access  Private (Admin)
exports.getAllLeaves = async (req, res) => {
  try {
    const { status, leaveType, department } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (leaveType && leaveType !== 'All') {
      query.leaveType = leaveType;
    }

    let leaves = await Leave.find(query)
      .populate('employee', 'firstName lastName employeeId department designation avatar leaveBalances')
      .populate('reviewedBy', 'firstName lastName designation')
      .sort({ createdAt: -1 });

    if (department && department !== 'All') {
      leaves = leaves.filter(l => l.employee && l.employee.department === department);
    }

    res.status(200).json({
      success: true,
      count: leaves.length,
      leaves
    });
  } catch (err) {
    console.error('getAllLeaves error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve leave requests.',
      error: err.message
    });
  }
};

// @desc    Get team leave requests (Manager)
// @route   GET /api/leaves/team-leaves
// @access  Private (Manager & Admin)
exports.getTeamLeaves = async (req, res) => {
  try {
    // Find team member IDs
    const teamMembers = await User.find({
      $or: [
        { manager: req.user._id },
        { department: req.user.department }
      ]
    }).select('_id');

    const memberIds = teamMembers.map(m => m._id);

    const leaves = await Leave.find({ employee: { $in: memberIds } })
      .populate('employee', 'firstName lastName employeeId department designation avatar leaveBalances')
      .populate('reviewedBy', 'firstName lastName designation')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      leaves
    });
  } catch (err) {
    console.error('getTeamLeaves error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve team leave requests.',
      error: err.message
    });
  }
};

// @desc    Approve or Reject leave request
// @route   PUT /api/leaves/:id/review
// @access  Private (Admin & Manager)
exports.reviewLeave = async (req, res) => {
  try {
    const { status, reviewRemarks } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'Approved' or 'Rejected'."
      });
    }

    const leave = await Leave.findById(req.params.id).populate('employee');
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found.'
      });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `This leave request is already marked as ${leave.status}.`
      });
    }

    // Role verification for Manager: can only review their team's requests
    if (req.user.role === 'manager') {
      const isTeam =
        (leave.employee.manager && leave.employee.manager.toString() === req.user._id.toString()) ||
        leave.employee.department === req.user.department;

      if (!isTeam) {
        return res.status(403).json({
          success: false,
          message: 'Managers can only review leave requests from their own department/team.'
        });
      }
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    leave.reviewRemarks = reviewRemarks || '';

    // If approved, decrement the user's leave balance
    if (status === 'Approved') {
      const balanceKey = mapLeaveTypeToKey(leave.leaveType);
      if (balanceKey) {
        const emp = await User.findById(leave.employee._id);
        if (emp && emp.leaveBalances && emp.leaveBalances[balanceKey] !== undefined) {
          emp.leaveBalances[balanceKey] = Math.max(0, emp.leaveBalances[balanceKey] - leave.daysCount);
          await emp.save();
        }
      }
    }

    await leave.save();

    const updated = await Leave.findById(leave._id)
      .populate('employee', 'firstName lastName employeeId department designation leaveBalances avatar')
      .populate('reviewedBy', 'firstName lastName designation');

    res.status(200).json({
      success: true,
      message: `Leave application marked as ${status}.`,
      leave: updated
    });
  } catch (err) {
    console.error('reviewLeave error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to review leave application.',
      error: err.message
    });
  }
};

// @desc    Cancel a pending leave request
// @route   PUT /api/leaves/:id/cancel
// @access  Private (Employee)
exports.cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found.'
      });
    }

    if (leave.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own leave requests.'
      });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a leave request that has already been ${leave.status.toLowerCase()}.`
      });
    }

    leave.status = 'Cancelled';
    await leave.save();

    res.status(200).json({
      success: true,
      message: 'Leave application successfully cancelled.',
      leave
    });
  } catch (err) {
    console.error('cancelLeave error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel leave application.',
      error: err.message
    });
  }
};
