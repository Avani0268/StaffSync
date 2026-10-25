const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Attendance = require('./models/Attendance');
const Leave = require('./models/Leave');
const Announcement = require('./models/Announcement');
const Training = require('./models/Training');

const seedData = async (disconnectAfter = false) => {
  try {
    console.log('--- Seeding StaffSync Database Records ---');

    // Clear existing collections
    await User.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    await Announcement.deleteMany({});
    await Training.deleteMany({});

    const defaultPassword = 'Password123!';

    // HR Administrator
    const admin = await User.create({
      employeeId: 'EMP-001',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      email: 'admin@staffsync.com',
      password: defaultPassword,
      role: 'admin',
      department: 'Human Resources',
      designation: 'Chief Human Resources Officer',
      phone: '+1 (555) 019-2834',
      address: '742 Evergreen Terrace, Springfield, OR',
      emergencyContact: {
        name: 'Mark Jenkins',
        relation: 'Spouse',
        phone: '+1 (555) 019-2835'
      },
      salary: 115000,
      skills: ['Talent Acquisition', 'HR Strategy', 'Labor Law', 'Executive Coaching'],
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256'
    });

    // Engineering Manager
    const engManager = await User.create({
      employeeId: 'EMP-002',
      firstName: 'David',
      lastName: 'Miller',
      email: 'manager.eng@staffsync.com',
      password: defaultPassword,
      role: 'manager',
      department: 'Engineering',
      designation: 'Engineering Lead & Tech Manager',
      phone: '+1 (555) 014-9912',
      address: '10880 Wilshire Blvd, Los Angeles, CA',
      emergencyContact: {
        name: 'Lisa Miller',
        relation: 'Spouse',
        phone: '+1 (555) 014-9913'
      },
      salary: 125000,
      skills: ['System Architecture', 'Node.js', 'React', 'Team Leadership', 'Cloud Infrastructure'],
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256'
    });

    // HR Manager
    const hrManager = await User.create({
      employeeId: 'EMP-003',
      firstName: 'Elena',
      lastName: 'Rostova',
      email: 'manager.hr@staffsync.com',
      password: defaultPassword,
      role: 'manager',
      department: 'Human Resources',
      designation: 'Talent & Operations Manager',
      phone: '+1 (555) 017-3341',
      address: '350 5th Ave, New York, NY',
      emergencyContact: {
        name: 'Igor Rostov',
        relation: 'Brother',
        phone: '+1 (555) 017-3342'
      },
      salary: 92000,
      skills: ['HR Operations', 'Employee Relations', 'Conflict Resolution', 'Benefits Administration'],
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256'
    });

    // Employees
    const emp1 = await User.create({
      employeeId: 'EMP-004',
      firstName: 'Alex',
      lastName: 'Turner',
      email: 'alex.turner@staffsync.com',
      password: defaultPassword,
      role: 'employee',
      department: 'Engineering',
      designation: 'Senior Fullstack Engineer',
      manager: engManager._id,
      phone: '+1 (555) 012-7721',
      address: '42 Market Street, San Francisco, CA',
      emergencyContact: {
        name: 'Hannah Turner',
        relation: 'Sister',
        phone: '+1 (555) 012-7722'
      },
      salary: 98000,
      skills: ['React.js', 'Express', 'MongoDB', 'TypeScript', 'Docker'],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
    });

    const emp2 = await User.create({
      employeeId: 'EMP-005',
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'priya.sharma@staffsync.com',
      password: defaultPassword,
      role: 'employee',
      department: 'Engineering',
      designation: 'Frontend UI/UX Engineer',
      manager: engManager._id,
      phone: '+1 (555) 018-8843',
      address: '500 Howard St, San Francisco, CA',
      emergencyContact: {
        name: 'Raj Sharma',
        relation: 'Father',
        phone: '+1 (555) 018-8844'
      },
      salary: 88000,
      skills: ['React', 'CSS3 / Bootstrap', 'Figma', 'Responsive UI', 'Accessibility'],
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256'
    });

    const emp3 = await User.create({
      employeeId: 'EMP-006',
      firstName: 'Marcus',
      lastName: 'Vance',
      email: 'marcus.vance@staffsync.com',
      password: defaultPassword,
      role: 'employee',
      department: 'Marketing',
      designation: 'Product Growth Specialist',
      phone: '+1 (555) 011-3490',
      address: '220 Boylston St, Boston, MA',
      emergencyContact: {
        name: 'Jessica Vance',
        relation: 'Spouse',
        phone: '+1 (555) 011-3491'
      },
      salary: 76000,
      skills: ['SEO', 'Content Strategy', 'Google Analytics', 'A/B Testing'],
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256'
    });

    const emp4 = await User.create({
      employeeId: 'EMP-007',
      firstName: 'Chloe',
      lastName: 'Bennett',
      email: 'chloe.bennett@staffsync.com',
      password: defaultPassword,
      role: 'employee',
      department: 'Finance',
      designation: 'Senior Financial Analyst',
      phone: '+1 (555) 016-5621',
      address: '150 S Wacker Dr, Chicago, IL',
      emergencyContact: {
        name: 'Robert Bennett',
        relation: 'Father',
        phone: '+1 (555) 016-5622'
      },
      salary: 82000,
      skills: ['Financial Modeling', 'Budget Forecasting', 'Auditing', 'QuickBooks'],
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256'
    });

    const allUsers = [admin, engManager, hrManager, emp1, emp2, emp3, emp4];
    const formatDate = (dateObj) => dateObj.toISOString().split('T')[0];

    // Past 5 days attendance
    for (let i = 5; i >= 1; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = formatDate(d);
      if (d.getDay() === 0) continue; // skip Sunday

      for (const u of allUsers) {
        const checkInTime = new Date(d);
        const isLate = Math.random() < 0.2;
        checkInTime.setHours(isLate ? 9 : 8, isLate ? 45 : 55, 0);

        const checkOutTime = new Date(d);
        checkOutTime.setHours(17, Math.floor(Math.random() * 30) + 15, 0);

        const diffHours = parseFloat(
          ((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)).toFixed(2)
        );

        await Attendance.create({
          employee: u._id,
          date: dateStr,
          checkIn: checkInTime,
          checkOut: checkOutTime,
          workHours: diffHours,
          status: isLate ? 'Late' : 'Present',
          location: Math.random() > 0.3 ? 'Office HQ' : 'Remote',
          notes: isLate ? 'Transit delay' : 'Standard business day'
        });
      }
    }

    // Today's attendance
    const today = new Date();
    const todayStr = formatDate(today);

    const alexCheckIn = new Date(today);
    alexCheckIn.setHours(9, 5, 0);
    await Attendance.create({
      employee: emp1._id,
      date: todayStr,
      checkIn: alexCheckIn,
      checkOut: null,
      workHours: 0,
      status: 'Present',
      location: 'Office HQ',
      notes: 'Logged in from Office Workstation 4B'
    });

    const davidCheckIn = new Date(today);
    davidCheckIn.setHours(8, 50, 0);
    await Attendance.create({
      employee: engManager._id,
      date: todayStr,
      checkIn: davidCheckIn,
      checkOut: null,
      workHours: 0,
      status: 'Present',
      location: 'Office HQ',
      notes: 'Morning engineering standup'
    });

    const priyaCheckIn = new Date(today);
    priyaCheckIn.setHours(9, 42, 0);
    await Attendance.create({
      employee: emp2._id,
      date: todayStr,
      checkIn: priyaCheckIn,
      checkOut: null,
      workHours: 0,
      status: 'Late',
      location: 'Remote',
      notes: 'Working from home due to bad weather'
    });

    // Leaves
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekEnd = new Date(nextWeek);
    nextWeekEnd.setDate(nextWeek.getDate() + 2);

    await Leave.create({
      employee: emp1._id,
      leaveType: 'Annual Leave',
      startDate: nextWeek,
      endDate: nextWeekEnd,
      daysCount: 3,
      reason: 'Annual family road trip and mountain retreat.',
      status: 'Pending'
    });

    const casualDate = new Date();
    casualDate.setDate(casualDate.getDate() + 4);
    await Leave.create({
      employee: emp2._id,
      leaveType: 'Casual Leave',
      startDate: casualDate,
      endDate: casualDate,
      daysCount: 1,
      reason: 'Urgent passport renewal appointment at embassy.',
      status: 'Pending'
    });

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 10);
    const lastWeekEnd = new Date(lastWeek);
    lastWeekEnd.setDate(lastWeek.getDate() + 1);

    await Leave.create({
      employee: emp3._id,
      leaveType: 'Sick Leave',
      startDate: lastWeek,
      endDate: lastWeekEnd,
      daysCount: 2,
      reason: 'Severe flu symptoms and doctor advised bed rest.',
      status: 'Approved',
      reviewedBy: admin._id,
      reviewedAt: new Date(lastWeek.getTime() - 86400000),
      reviewRemarks: 'Approved. Get well soon!'
    });

    const auditWeek = new Date();
    auditWeek.setDate(auditWeek.getDate() + 2);
    const auditWeekEnd = new Date(auditWeek);
    auditWeekEnd.setDate(auditWeek.getDate() + 4);

    await Leave.create({
      employee: emp4._id,
      leaveType: 'Annual Leave',
      startDate: auditWeek,
      endDate: auditWeekEnd,
      daysCount: 5,
      reason: 'Personal vacation trip abroad.',
      status: 'Rejected',
      reviewedBy: admin._id,
      reviewedAt: new Date(),
      reviewRemarks: 'Rejected due to critical Q4 financial audit week. Please reschedule.'
    });

    // Announcements
    await Announcement.create({
      title: 'StaffSync Annual Innovation Hackathon 2026',
      content: 'We are thrilled to announce our upcoming Hackathon taking place next month. Form your cross-department teams of 3-4 and pitch innovative AI and workflow products. Exciting cash prizes and executive sponsorships await!',
      category: 'Holiday & Events',
      priority: 'high',
      isPinned: true,
      targetDepartment: 'All',
      author: admin._id
    });

    await Announcement.create({
      title: 'Updated 2026 Hybrid Work Policy & Flexible Hours',
      content: 'The HR department has updated guidelines for hybrid working. Core collaboration hours are 10:00 AM – 4:00 PM local time. Please ensure you punch in/out on StaffSync daily for automated attendance compliance.',
      category: 'HR Policy',
      priority: 'medium',
      isPinned: true,
      targetDepartment: 'All',
      author: admin._id
    });

    await Announcement.create({
      title: 'Engineering Tech Talk: High Performance Node.js Architecture',
      content: 'Join Tech Lead David Miller this Thursday at 4 PM in Auditorium A / Zoom for an interactive session on event-loop optimization, MongoDB indexing strategies, and real-time scaling.',
      category: 'Company News',
      priority: 'medium',
      isPinned: false,
      targetDepartment: 'Engineering',
      author: engManager._id
    });

    await Announcement.create({
      title: 'Corporate Health & Wellness Fair',
      content: 'Free annual health checkups, ergonomic evaluations, and mindfulness counseling will be available on the 2nd floor from Wednesday to Friday. All employees are warmly encouraged to take advantage of these benefits.',
      category: 'General',
      priority: 'low',
      isPinned: false,
      targetDepartment: 'All',
      author: hrManager._id
    });

    // Training Programs
    const trainStart1 = new Date();
    trainStart1.setDate(trainStart1.getDate() - 3);
    const trainEnd1 = new Date();
    trainEnd1.setDate(trainEnd1.getDate() + 14);

    await Training.create({
      title: 'Fullstack Security & Modern MERN Architecture',
      description: 'Comprehensive deep dive into JWT state management, MongoDB injection prevention, OWASP security top 10, and high-performance React UI patterns.',
      category: 'Technical Skills',
      trainer: 'Dr. Evelyn Reed (Lead Architect)',
      startDate: trainStart1,
      endDate: trainEnd1,
      durationHours: 16,
      status: 'In Progress',
      targetDepartment: 'Engineering',
      createdBy: engManager._id,
      enrolledEmployees: [
        {
          employee: emp1._id,
          enrolledAt: trainStart1,
          status: 'In Progress',
          progress: 65,
          feedback: 'Excellent modules on JWT and MongoDB query indexing.'
        },
        {
          employee: emp2._id,
          enrolledAt: trainStart1,
          status: 'In Progress',
          progress: 35,
          feedback: 'Very helpful frontend security sections.'
        }
      ]
    });

    const trainStart2 = new Date();
    trainStart2.setDate(trainStart2.getDate() + 5);
    const trainEnd2 = new Date();
    trainEnd2.setDate(trainEnd2.getDate() + 20);

    await Training.create({
      title: 'Empathetic Leadership & Agile Team Dynamics',
      description: 'Designed for engineering leads and managers to cultivate psychological safety, lead high-velocity retrospectives, and handle constructive feedback effectively.',
      category: 'Leadership',
      trainer: 'Marcus Sterling (Executive Coach)',
      startDate: trainStart2,
      endDate: trainEnd2,
      durationHours: 12,
      status: 'Upcoming',
      targetDepartment: 'All',
      createdBy: admin._id,
      enrolledEmployees: [
        {
          employee: engManager._id,
          enrolledAt: new Date(),
          status: 'Enrolled',
          progress: 0
        },
        {
          employee: hrManager._id,
          enrolledAt: new Date(),
          status: 'Enrolled',
          progress: 0
        }
      ]
    });

    const trainStart3 = new Date();
    trainStart3.setDate(trainStart3.getDate() - 20);
    const trainEnd3 = new Date();
    trainEnd3.setDate(trainEnd3.getDate() - 5);

    await Training.create({
      title: 'Corporate Compliance & Workplace Data Protection 2026',
      description: 'Mandatory annual refresher covering GDPR compliance, customer data privacy, and workplace anti-harassment regulations.',
      category: 'Compliance & Safety',
      trainer: 'Global Compliance Legal Team',
      startDate: trainStart3,
      endDate: trainEnd3,
      durationHours: 6,
      status: 'Completed',
      targetDepartment: 'All',
      createdBy: admin._id,
      enrolledEmployees: [
        {
          employee: emp1._id,
          enrolledAt: trainStart3,
          status: 'Completed',
          progress: 100,
          completedAt: trainEnd3,
          feedback: 'Clear and thorough compliance review.'
        },
        {
          employee: emp3._id,
          enrolledAt: trainStart3,
          status: 'Completed',
          progress: 100,
          completedAt: trainEnd3,
          feedback: 'Important policies updated nicely.'
        },
        {
          employee: emp4._id,
          enrolledAt: trainStart3,
          status: 'Completed',
          progress: 100,
          completedAt: trainEnd3,
          feedback: 'Crucial refresher for finance handling.'
        }
      ]
    });

    console.log('--- StaffSync Database Seed Completed Successfully! ---');

    if (disconnectAfter) {
      const { disconnectDB } = require('./config/db');
      await disconnectDB();
      process.exit(0);
    }
  } catch (err) {
    console.error('Seed execution error:', err);
    if (disconnectAfter) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  const { connectDB } = require('./config/db');
  connectDB().then(() => seedData(true));
}

module.exports = { seedData };
