import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const Employees = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';

  const [employees, setEmployees] = useState([]);
  const [managersList, setManagersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [role, setRole] = useState('All');
  const [status, setStatus] = useState('All');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);

  // Form State
  const initialForm = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'employee',
    department: 'Engineering',
    designation: '',
    phone: '',
    address: '',
    salary: 65000,
    manager: '',
    skills: '',
    employeeId: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const [modalLoading, setModalLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      let endpoint = '/employees';
      if (isManager && !isAdmin) {
        endpoint = '/employees/team/members';
      }

      const params = {};
      if (search) params.search = search;
      if (department !== 'All') params.department = department;
      if (role !== 'All') params.role = role;
      if (status !== 'All') params.status = status;

      const res = await API.get(endpoint, { params });
      const list = res.data.employees || res.data.teamMembers || [];
      setEmployees(list);

      // Collect managers for assign dropdown
      const mgrs = list.filter(e => e.role === 'manager' || e.role === 'admin');
      setManagersList(mgrs);
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [department, role, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEmployees();
  };

  const openAddModal = () => {
    setFormData(initialForm);
    setShowAddModal(true);
  };

  const openEditModal = (emp) => {
    setSelectedEmp(emp);
    setFormData({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      role: emp.role,
      department: emp.department,
      designation: emp.designation,
      phone: emp.phone || '',
      address: emp.address || '',
      salary: emp.salary || 65000,
      manager: emp.manager?._id || '',
      skills: emp.skills ? emp.skills.join(', ') : '',
      status: emp.status || 'active'
    });
    setShowEditModal(true);
  };

  const openViewModal = (emp) => {
    setSelectedEmp(emp);
    setShowViewModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      const res = await API.post('/employees', formData);
      if (res.data && res.data.success) {
        setShowAddModal(false);
        setFeedback({ type: 'success', message: 'Employee added successfully!' });
        fetchEmployees();
        setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create employee');
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmp) return;
    setModalLoading(true);

    try {
      const res = await API.put(`/employees/${selectedEmp._id}`, formData);
      if (res.data && res.data.success) {
        setShowEditModal(false);
        setFeedback({ type: 'success', message: 'Employee details updated!' });
        fetchEmployees();
        setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update employee');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteEmployee = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove employee record for ${name}?`)) {
      return;
    }
    try {
      await API.delete(`/employees/${id}`);
      setFeedback({ type: 'success', message: 'Employee record removed.' });
      fetchEmployees();
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            {isManager && !isAdmin ? 'My Team Members' : 'Employee Directory'}
          </h2>
          <p className="text-secondary small mb-0">
            {isManager && !isAdmin
              ? 'View employees reporting to your team and supervise their records.'
              : 'Manage company personnel, departmental assignments, and credentials.'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openAddModal}
            className="btn btn-indigo d-flex align-items-center gap-2 shadow-sm btn-sm py-2 px-3"
          >
            <i className="bi bi-person-plus-fill"></i>
            <span>Add New Employee</span>
          </button>
        )}
      </div>

      {feedback.message && (
        <div className={`alert alert-${feedback.type} alert-dismissible fade show py-2 px-3 small d-flex align-items-center gap-2 mb-4`} role="alert">
          <i className="bi bi-check-circle-fill"></i>
          <div>{feedback.message}</div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="staff-card p-3 mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-12 col-md-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-secondary border-end-0">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by name, ID, email, role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-outline-secondary" type="submit">
                Search
              </button>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select form-select-sm"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Finance">Finance</option>
              <option value="Design">Design</option>
              <option value="Operations">Operations</option>
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="col-6 col-md-1 text-end">
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setDepartment('All');
                setRole('All');
                setStatus('All');
              }}
              className="btn btn-sm btn-link text-secondary text-decoration-none p-0"
              title="Reset Filters"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Employees Table */}
      <div className="staff-card overflow-hidden">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading employees...</span>
            </div>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-people fs-1 text-secondary d-block mb-2"></i>
            No employees match the specified criteria.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="staff-table align-middle">
              <thead>
                <tr>
                  <th>Employee Info</th>
                  <th>ID</th>
                  <th>Department & Role</th>
                  <th>Designation</th>
                  <th>Manager</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2.5">
                        <img
                          src={emp.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.fullName || emp.firstName)}&background=4f46e5&color=fff`}
                          alt=""
                          className="rounded-circle border"
                          style={{ width: '38px', height: '38px', objectFit: 'cover' }}
                        />
                        <div>
                          <div className="fw-semibold text-dark small">
                            {emp.firstName} {emp.lastName}
                          </div>
                          <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
                            {emp.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border small fw-mono">
                        {emp.employeeId}
                      </span>
                    </td>
                    <td>
                      <div className="small fw-medium text-dark">{emp.department}</div>
                      <span className={`badge badge-role-${emp.role} small mt-0.5`} style={{ fontSize: '0.7rem' }}>
                        {emp.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="small text-secondary">{emp.designation}</td>
                    <td className="small text-secondary">
                      {emp.manager ? `${emp.manager.firstName} ${emp.manager.lastName}` : <span className="text-muted">None</span>}
                    </td>
                    <td>
                      <span className={`badge ${emp.status === 'active' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'} small`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        <button
                          onClick={() => openViewModal(emp)}
                          className="btn btn-sm btn-light border p-1 px-2"
                          title="View Details"
                        >
                          <i className="bi bi-eye"></i>
                        </button>

                        {isAdmin && (
                          <>
                            <button
                              onClick={() => openEditModal(emp)}
                              className="btn btn-sm btn-light border p-1 px-2 text-primary"
                              title="Edit Employee"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(emp._id, `${emp.firstName} ${emp.lastName}`)}
                              className="btn btn-sm btn-light border p-1 px-2 text-danger"
                              title="Delete Record"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {showViewModal && selectedEmp && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Employee Profile</h5>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="d-flex align-items-center gap-3 mb-3 p-3 bg-light rounded-3">
                  <img
                    src={selectedEmp.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedEmp.firstName)}&background=4f46e5&color=fff`}
                    alt=""
                    className="rounded-circle border"
                    style={{ width: '56px', height: '56px', objectFit: 'cover' }}
                  />
                  <div>
                    <h5 className="fw-bold mb-0">{selectedEmp.firstName} {selectedEmp.lastName}</h5>
                    <span className="text-secondary small">{selectedEmp.designation} • {selectedEmp.department}</span>
                    <div>
                      <span className="badge bg-primary-subtle text-primary small me-1">{selectedEmp.employeeId}</span>
                      <span className="badge bg-secondary-subtle text-secondary small">{selectedEmp.role}</span>
                    </div>
                  </div>
                </div>

                <div className="row g-2 small">
                  <div className="col-6">
                    <span className="text-secondary">Email:</span>
                    <div className="fw-semibold">{selectedEmp.email}</div>
                  </div>
                  <div className="col-6">
                    <span className="text-secondary">Phone:</span>
                    <div className="fw-semibold">{selectedEmp.phone || 'N/A'}</div>
                  </div>
                  <div className="col-6">
                    <span className="text-secondary">Date of Joining:</span>
                    <div className="fw-semibold">{new Date(selectedEmp.dateOfJoining).toLocaleDateString()}</div>
                  </div>
                  <div className="col-6">
                    <span className="text-secondary">Reporting Manager:</span>
                    <div className="fw-semibold">{selectedEmp.manager ? `${selectedEmp.manager.firstName} ${selectedEmp.manager.lastName}` : 'Direct'}</div>
                  </div>
                  <div className="col-12 mt-2">
                    <span className="text-secondary">Office / Address:</span>
                    <div className="fw-semibold">{selectedEmp.address || 'N/A'}</div>
                  </div>
                  <div className="col-12 mt-2">
                    <span className="text-secondary">Skills & Expertise:</span>
                    <div className="d-flex flex-wrap gap-1 mt-1">
                      {selectedEmp.skills && selectedEmp.skills.length > 0 ? (
                        selectedEmp.skills.map((s, idx) => (
                          <span key={idx} className="badge bg-light text-dark border small">{s}</span>
                        ))
                      ) : <span className="text-muted">No skills listed</span>}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowViewModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Add New Employee</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleAddSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">First Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Last Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Corporate Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Initial Password</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Leave blank for StaffSync@2026"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Department *</label>
                      <select
                        className="form-select"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Sales">Sales</option>
                        <option value="Finance">Finance</option>
                        <option value="Design">Design</option>
                        <option value="Operations">Operations</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Designation *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Senior Frontend Dev"
                        required
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Role *</label>
                      <select
                        className="form-select"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="admin">HR Administrator</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Annual Salary ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Reporting Manager</label>
                      <select
                        className="form-select"
                        value={formData.manager}
                        onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                      >
                        <option value="">None / Direct</option>
                        {managersList.map((m) => (
                          <option key={m._id} value={m._id}>
                            {m.firstName} {m.lastName} ({m.department})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Employee ID (Optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Auto-generated if empty"
                        value={formData.employeeId}
                        onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Phone Number</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Skills (Comma-separated)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="React, Node.js, Agile"
                        value={formData.skills}
                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" disabled={modalLoading} className="btn btn-indigo btn-sm">
                    {modalLoading ? 'Creating Record...' : 'Create Employee'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmp && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Edit Employee: {selectedEmp.firstName} {selectedEmp.lastName}</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Department</label>
                      <select
                        className="form-select"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Sales">Sales</option>
                        <option value="Finance">Finance</option>
                        <option value="Design">Design</option>
                        <option value="Operations">Operations</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Designation</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Role</label>
                      <select
                        className="form-select"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="admin">HR Administrator</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Salary ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Manager</label>
                      <select
                        className="form-select"
                        value={formData.manager}
                        onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                      >
                        <option value="">None / Direct</option>
                        {managersList.map((m) => (
                          <option key={m._id} value={m._id}>
                            {m.firstName} {m.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowEditModal(false)}>Cancel</button>
                  <button type="submit" disabled={modalLoading} className="btn btn-indigo btn-sm">
                    {modalLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
