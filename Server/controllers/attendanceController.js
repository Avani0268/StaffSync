const Attendance = require('../models/Attendance');
const User = require('../models/User');

const getTodayString = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

// @desc    Check-in attendance for today
// @route   POST /api/attendance/check-in
// @access  Private (All roles)
exports.checkIn = async (req, res) => {
  try {
    const today = getTodayString();
    const employeeId = req.user._id;
    const { location, notes } = req.body;

    let record = await Attendance.findOne({ employee: employeeId, date: today });

    if (record && record.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked in for today.',
        attendance: record
      });
    }

    const now = new Date();
    // Default threshold for late arrival: 09:30 AM local time
    const lateThreshold = new Date();
    lateThreshold.setHours(9, 30, 0, 0);

    const isLate = now > lateThreshold;
    const status = isLate ? 'Late' : 'Present';

    if (!record) {
      record = new Attendance({
        employee: employeeId,
        date: today,
        checkIn: now,
        status,
        location: location || 'Office HQ',
        notes: notes || ''
      });
    } else {
      record.checkIn = now;
      record.status = status;
      if (location) record.location = location;
      if (notes) record.notes = notes;
    }

    await record.save();

    res.status(200).json({
      success: true,
      message: `Checked in successfully as ${status}!`,
      attendance: record
    });
  } catch (err) {
    console.error('checkIn error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to record check-in.',
      error: err.message
    });
  }
};

// @desc    Check-out attendance for today
// @route   POST /api/attendance/check-out
// @access  Private (All roles)
exports.checkOut = async (req, res) => {
  try {
    const today = getTodayString();
    const employeeId = req.user._id;

    const record = await Attendance.findOne({ employee: employeeId, date: today });

    if (!record || !record.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Cannot check out without an active check-in for today.'
      });
    }

    if (record.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked out for today.',
        attendance: record
      });
    }

    const now = new Date();
    record.checkOut = now;

    // Calculate hours worked
    const diffMs = now.getTime() - new Date(record.checkIn).getTime();
    const hours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    record.workHours = hours;

    if (hours < 4 && record.status === 'Present') {
      record.status = 'Half-day';
    }

    await record.save();

    res.status(200).json({
      success: true,
      message: `Checked out successfully! Total working hours: ${hours} hrs.`,
      attendance: record
    });
  } catch (err) {
    console.error('checkOut error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to record check-out.',
      error: err.message
    });
  }
};

// @desc    Get today's attendance status for logged-in user
// @route   GET /api/attendance/today
// @access  Private
exports.getTodayAttendance = async (req, res) => {
  try {
    const today = getTodayString();
    const record = await Attendance.findOne({ employee: req.user._id, date: today });

    res.status(200).json({
      success: true,
      attendance: record || null
    });
  } catch (err) {
    console.error('getTodayAttendance error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today status.',
      error: err.message
    });
  }
};

// @desc    Get logged in user's attendance history
// @route   GET /api/attendance/my-history
// @access  Private
exports.getMyAttendanceHistory = async (req, res) => {
  try {
    const { startDate, endDate, limit = 30 } = req.query;
    const query = { employee: req.user._id };

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const history = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));

    // Summary stats for the employee
    const totalPresent = history.filter(h => h.status === 'Present').length;
    const totalLate = history.filter(h => h.status === 'Late').length;
    const totalHalfDay = history.filter(h => h.status === 'Half-day').length;
    const totalHours = history.reduce((sum, h) => sum + (h.workHours || 0), 0);

    res.status(200).json({
      success: true,
      count: history.length,
      stats: {
        totalPresent,
        totalLate,
        totalHalfDay,
        totalHours: parseFloat(totalHours.toFixed(1))
      },
      history
    });
  } catch (err) {
    console.error('getMyAttendanceHistory error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve attendance logs.',
      error: err.message
    });
  }
};

// @desc    Get company or team attendance
// @route   GET /api/attendance
// @access  Private (Admin & Manager)
exports.getAllAttendance = async (req, res) => {
  try {
    const { date = getTodayString(), department, status } = req.query;
    let employeeQuery = {};

    if (req.user.role === 'manager') {
      employeeQuery = {
        $or: [
          { manager: req.user._id },
          { department: req.user.department }
        ]
      };
    } else if (department && department !== 'All') {
      employeeQuery.department = department;
    }

    const eligibleEmployees = await User.find(employeeQuery)
      .select('firstName lastName employeeId department designation status avatar');

    const empIds = eligibleEmployees.map(e => e._id);

    const attendanceRecords = await Attendance.find({
      employee: { $in: empIds },
      date: date
    }).populate('employee', 'firstName lastName employeeId department designation avatar');

    // Create a complete view matching all eligible employees with their attendance or 'Absent'
    const recordMap = new Map();
    attendanceRecords.forEach(rec => {
      if (rec.employee) {
        recordMap.set(rec.employee._id.toString(), rec);
      }
    });

    let combined = eligibleEmployees.map(emp => {
      const rec = recordMap.get(emp._id.toString());
      if (rec) {
        return rec;
      }
      return {
        _id: `unlogged-${emp._id}`,
        employee: emp,
        date: date,
        checkIn: null,
        checkOut: null,
        workHours: 0,
        status: 'Absent',
        location: 'None',
        notes: 'No punch recorded yet'
      };
    });

    if (status && status !== 'All') {
      combined = combined.filter(item => item.status === status);
    }

    res.status(200).json({
      success: true,
      date,
      count: combined.length,
      attendance: combined
    });
  } catch (err) {
    console.error('getAllAttendance error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve attendance roster.',
      error: err.message
    });
  }
};

// @desc    Admin manual attendance adjustment
// @route   POST /api/attendance/manual
// @access  Private (Admin only)
exports.manualAttendance = async (req, res) => {
  try {
    const { employeeId, date, checkIn, checkOut, status, notes, location } = req.body;

    if (!employeeId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID and date are required.'
      });
    }

    let record = await Attendance.findOne({ employee: employeeId, date });

    if (!record) {
      record = new Attendance({
        employee: employeeId,
        date
      });
    }

    if (checkIn) record.checkIn = new Date(checkIn);
    if (checkOut) record.checkOut = new Date(checkOut);
    if (status) record.status = status;
    if (notes) record.notes = notes;
    if (location) record.location = location;

    if (record.checkIn && record.checkOut) {
      const diffMs = new Date(record.checkOut).getTime() - new Date(record.checkIn).getTime();
      record.workHours = parseFloat((Math.max(0, diffMs) / (1000 * 60 * 60)).toFixed(2));
    }

    await record.save();

    const populated = await Attendance.findById(record._id)
      .populate('employee', 'firstName lastName employeeId department designation');

    res.status(200).json({
      success: true,
      message: 'Attendance record updated successfully.',
      attendance: populated
    });
  } catch (err) {
    console.error('manualAttendance error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to manually adjust attendance.',
      error: err.message
    });
  }
};
