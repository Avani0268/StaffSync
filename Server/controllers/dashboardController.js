const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Announcement = require('../models/Announcement');
const Training = require('../models/Training');

const getTodayString = () => new Date().toISOString().split('T')[0];

// @desc    Get Admin Dashboard analytics & metrics
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
exports.getAdminDashboard = async (req, res) => {
  try {
    const today = getTodayString();

    // 1. Employees counts
    const totalEmployees = await User.countDocuments();
    const activeEmployees = await User.countDocuments({ status: 'active' });

    // Department distribution
    const departmentStats = await User.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 2. Attendance stats for today
    const todayAttendance = await Attendance.find({ date: today });
    const presentToday = todayAttendance.filter(a => a.status === 'Present').length;
    const lateToday = todayAttendance.filter(a => a.status === 'Late').length;
    const halfDayToday = todayAttendance.filter(a => a.status === 'Half-day').length;
    const checkedInCount = presentToday + lateToday + halfDayToday;
    const absentCount = Math.max(0, activeEmployees - checkedInCount);
    const attendanceRate = activeEmployees > 0
      ? Math.round((checkedInCount / activeEmployees) * 100)
      : 0;

    // 3. Pending leaves
    const pendingLeavesCount = await Leave.countDocuments({ status: 'Pending' });
    const recentLeaves = await Leave.find({ status: 'Pending' })
      .populate('employee', 'firstName lastName employeeId department designation avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    // 4. Trainings
    const totalTrainings = await Training.countDocuments();
    const activeTrainings = await Training.countDocuments({
      status: { $in: ['Upcoming', 'In Progress'] }
    });

    // 5. Last 7 days attendance trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const dateList = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dateList.push(d.toISOString().split('T')[0]);
    }

    const weeklyRecords = await Attendance.find({
      date: { $in: dateList }
    });

    const weeklyTrend = dateList.map(dateStr => {
      const dayRecords = weeklyRecords.filter(r => r.date === dateStr);
      const present = dayRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
      return {
        date: dateStr,
        present,
        absent: Math.max(0, activeEmployees - present)
      };
    });

    // 6. Recent announcements
    const recentAnnouncements = await Announcement.find()
      .populate('author', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(4);

    res.status(200).json({
      success: true,
      stats: {
        totalEmployees,
        activeEmployees,
        presentToday,
        lateToday,
        halfDayToday,
        absentCount,
        attendanceRate,
        pendingLeavesCount,
        activeTrainings,
        totalTrainings
      },
      departmentStats,
      weeklyTrend,
      recentLeaves,
      recentAnnouncements
    });
  } catch (err) {
    console.error('getAdminDashboard error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin dashboard metrics.',
      error: err.message
    });
  }
};

// @desc    Get Manager Dashboard metrics
// @route   GET /api/dashboard/manager
// @access  Private (Manager)
exports.getManagerDashboard = async (req, res) => {
  try {
    const today = getTodayString();
    const managerId = req.user._id;

    // 1. Team members
    const teamMembers = await User.find({
      $or: [
        { manager: managerId },
        { department: req.user.department }
      ],
      _id: { $ne: managerId }
    }).select('firstName lastName employeeId department designation status avatar');

    const teamCount = teamMembers.length;
    const teamIds = teamMembers.map(m => m._id);

    // 2. Team attendance today
    const teamAttendance = await Attendance.find({
      employee: { $in: teamIds },
      date: today
    });

    const teamPresent = teamAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
    const teamLate = teamAttendance.filter(a => a.status === 'Late').length;
    const teamAbsent = Math.max(0, teamCount - teamAttendance.length);
    const teamAttendanceRate = teamCount > 0 ? Math.round((teamPresent / teamCount) * 100) : 0;

    // 3. Team pending leaves
    const teamPendingLeaves = await Leave.find({
      employee: { $in: teamIds },
      status: 'Pending'
    })
      .populate('employee', 'firstName lastName employeeId department designation avatar')
      .sort({ createdAt: -1 });

    // 4. Team training participation
    const trainings = await Training.find({
      'enrolledEmployees.employee': { $in: teamIds }
    });

    let teamEnrolledCount = 0;
    let teamCompletedCount = 0;

    trainings.forEach(t => {
      t.enrolledEmployees.forEach(e => {
        if (teamIds.some(id => id.toString() === e.employee.toString())) {
          teamEnrolledCount++;
          if (e.status === 'Completed') {
            teamCompletedCount++;
          }
        }
      });
    });

    // 5. Manager's own attendance today
    const myTodayAttendance = await Attendance.findOne({
      employee: managerId,
      date: today
    });

    res.status(200).json({
      success: true,
      stats: {
        teamCount,
        teamPresent,
        teamLate,
        teamAbsent,
        teamAttendanceRate,
        pendingLeavesCount: teamPendingLeaves.length,
        teamEnrolledCount,
        teamCompletedCount
      },
      teamPendingLeaves,
      teamMembers: teamMembers.slice(0, 6),
      myTodayAttendance
    });
  } catch (err) {
    console.error('getManagerDashboard error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve manager dashboard metrics.',
      error: err.message
    });
  }
};

// @desc    Get Employee Dashboard metrics
// @route   GET /api/dashboard/employee
// @access  Private (Employee)
exports.getEmployeeDashboard = async (req, res) => {
  try {
    const today = getTodayString();
    const userId = req.user._id;

    // 1. User profile and balances
    const user = await User.findById(userId)
      .select('leaveBalances department designation dateOfJoining manager')
      .populate('manager', 'firstName lastName email designation');

    // 2. Today's attendance
    const todayAttendance = await Attendance.findOne({
      employee: userId,
      date: today
    });

    // 3. Current month attendance stats
    const currentMonth = today.substring(0, 7); // YYYY-MM
    const monthRecords = await Attendance.find({
      employee: userId,
      date: new RegExp(`^${currentMonth}`)
    });

    const daysPresent = monthRecords.filter(r => r.status === 'Present').length;
    const daysLate = monthRecords.filter(r => r.status === 'Late').length;
    const daysHalfDay = monthRecords.filter(r => r.status === 'Half-day').length;
    const totalHours = monthRecords.reduce((sum, r) => sum + (r.workHours || 0), 0);

    // 4. User's leaves
    const myLeaves = await Leave.find({ employee: userId })
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(4);

    const pendingLeaves = myLeaves.filter(l => l.status === 'Pending').length;

    // 5. User's trainings
    const trainings = await Training.find({
      'enrolledEmployees.employee': userId
    });

    const myTrainings = trainings.map(t => {
      const enrollment = t.enrolledEmployees.find(
        e => e.employee.toString() === userId.toString()
      );
      return {
        _id: t._id,
        title: t.title,
        category: t.category,
        trainer: t.trainer,
        startDate: t.startDate,
        endDate: t.endDate,
        progress: enrollment ? enrollment.progress : 0,
        status: enrollment ? enrollment.status : 'Enrolled'
      };
    });

    // 6. Latest announcements
    const announcements = await Announcement.find({
      $or: [
        { targetDepartment: 'All' },
        { targetDepartment: req.user.department }
      ]
    })
      .populate('author', 'firstName lastName')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(3);

    res.status(200).json({
      success: true,
      profile: user,
      todayAttendance,
      monthlyStats: {
        daysPresent,
        daysLate,
        daysHalfDay,
        totalHours: parseFloat(totalHours.toFixed(1)),
        recordsCount: monthRecords.length
      },
      leaveBalances: user.leaveBalances,
      pendingLeaves,
      recentLeaves: myLeaves,
      myTrainings,
      announcements
    });
  } catch (err) {
    console.error('getEmployeeDashboard error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve employee dashboard metrics.',
      error: err.message
    });
  }
};
