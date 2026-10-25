const User = require('../models/User');

// @desc    Get all employees with search and filters
// @route   GET /api/employees
// @access  Private (Admin & Manager)
exports.getAllEmployees = async (req, res) => {
  try {
    const { search, department, role, status } = req.query;
    const query = {};

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { employeeId: searchRegex },
        { designation: searchRegex }
      ];
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    if (role && role !== 'All') {
      query.role = role;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const employees = await User.find(query)
      .select('-password')
      .populate('manager', 'firstName lastName email designation')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      employees
    });
  } catch (err) {
    console.error('getAllEmployees error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee list.',
      error: err.message
    });
  }
};

// @desc    Get employee by ID
// @route   GET /api/employees/:id
// @access  Private
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id)
      .select('-password')
      .populate('manager', 'firstName lastName email designation department');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.'
      });
    }

    // Authorization check: Admins can see all, Managers can see department/team, Employees can see themselves
    if (
      req.user.role === 'employee' &&
      req.user._id.toString() !== employee._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own profile.'
      });
    }

    res.status(200).json({
      success: true,
      employee
    });
  } catch (err) {
    console.error('getEmployeeById error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve employee details.',
      error: err.message
    });
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (Admin only)
exports.createEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      department,
      designation,
      phone,
      address,
      salary,
      manager,
      skills,
      dateOfJoining,
      employeeId
    } = req.body;

    if (!firstName || !lastName || !email || !department || !designation) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, department, and designation are required.'
      });
    }

    // Check existing email
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'An employee with this email already exists.'
      });
    }

    // Auto-generate employeeId if not supplied
    let finalEmpId = employeeId;
    if (!finalEmpId) {
      const count = await User.countDocuments();
      finalEmpId = `EMP-${String(count + 101).padStart(3, '0')}`;
    }

    const existingId = await User.findOne({ employeeId: finalEmpId.toUpperCase() });
    if (existingId) {
      return res.status(400).json({
        success: false,
        message: `Employee ID ${finalEmpId} is already in use.`
      });
    }

    const newEmployee = new User({
      employeeId: finalEmpId.toUpperCase(),
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: password || 'StaffSync@2026', // default fallback password
      role: role || 'employee',
      department,
      designation,
      phone: phone || '',
      address: address || '',
      salary: salary ? Number(salary) : 60000,
      manager: manager || null,
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []),
      dateOfJoining: dateOfJoining || new Date()
    });

    await newEmployee.save();

    const created = await User.findById(newEmployee._id)
      .select('-password')
      .populate('manager', 'firstName lastName email designation');

    res.status(201).json({
      success: true,
      message: 'Employee record created successfully.',
      employee: created
    });
  } catch (err) {
    console.error('createEmployee error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create employee.',
      error: err.message
    });
  }
};

// @desc    Update employee details
// @route   PUT /api/employees/:id
// @access  Private (Admin only)
exports.updateEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found.'
      });
    }

    const {
      firstName,
      lastName,
      email,
      role,
      department,
      designation,
      phone,
      address,
      salary,
      manager,
      status,
      skills,
      leaveBalances
    } = req.body;

    if (email && email.toLowerCase() !== employee.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase(), _id: { $ne: employee._id } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email address already assigned to another employee.'
        });
      }
      employee.email = email.toLowerCase();
    }

    if (firstName) employee.firstName = firstName;
    if (lastName) employee.lastName = lastName;
    if (role) employee.role = role;
    if (department) employee.department = department;
    if (designation) employee.designation = designation;
    if (phone !== undefined) employee.phone = phone;
    if (address !== undefined) employee.address = address;
    if (salary !== undefined) employee.salary = Number(salary);
    if (manager !== undefined) employee.manager = manager || null;
    if (status) employee.status = status;
    if (skills) {
      employee.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    }
    if (leaveBalances) {
      employee.leaveBalances = {
        ...employee.leaveBalances,
        ...leaveBalances
      };
    }

    await employee.save();

    const updated = await User.findById(employee._id)
      .select('-password')
      .populate('manager', 'firstName lastName email designation');

    res.status(200).json({
      success: true,
      message: 'Employee record updated successfully.',
      employee: updated
    });
  } catch (err) {
    console.error('updateEmployee error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update employee.',
      error: err.message
    });
  }
};

// @desc    Delete or deactivate employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin only)
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.'
      });
    }

    // Prevent deleting oneself
    if (employee._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account.'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Employee record removed successfully.'
    });
  } catch (err) {
    console.error('deleteEmployee error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete employee.',
      error: err.message
    });
  }
};

// @desc    Get team members under a Manager
// @route   GET /api/employees/team/members
// @access  Private (Manager & Admin)
exports.getTeamMembers = async (req, res) => {
  try {
    const managerId = req.user._id;

    // A manager can see employees directly reporting to them or employees in the same department
    const teamMembers = await User.find({
      $or: [
        { manager: managerId },
        { department: req.user.department }
      ],
      _id: { $ne: managerId }
    })
      .select('-password')
      .populate('manager', 'firstName lastName email designation')
      .sort({ firstName: 1 });

    res.status(200).json({
      success: true,
      count: teamMembers.length,
      teamMembers
    });
  } catch (err) {
    console.error('getTeamMembers error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve team members.',
      error: err.message
    });
  }
};
