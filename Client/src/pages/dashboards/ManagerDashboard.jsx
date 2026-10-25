import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';

const ManagerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await API.get('/dashboard/manager');
      if (res.data && res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error loading manager dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleReviewLeave = async (leaveId, status) => {
    try {
      await API.put(`/leaves/${leaveId}/review`, {
        status,
        reviewRemarks: `Reviewed by Team Manager (${status})`
      });
      setActionMsg(`Team leave request marked as ${status}!`);
      fetchDashboard();
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Manager Dashboard...</span>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const teamPendingLeaves = data?.teamPendingLeaves || [];
  const teamMembers = data?.teamMembers || [];

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Team Operations Dashboard</h2>
          <p className="text-secondary small mb-0">
            Monitor direct reports, review leave requests, and oversee team attendance.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Link to="/attendance" className="btn btn-indigo btn-sm py-2 px-3 d-flex align-items-center gap-2">
            <i className="bi bi-clock-history"></i>
            <span>Team Attendance</span>
          </Link>
          <Link to="/leaves" className="btn btn-outline-secondary btn-sm py-2 px-3 d-flex align-items-center gap-2">
            <i className="bi bi-calendar2-check"></i>
            <span>Team Leaves</span>
          </Link>
        </div>
      </div>

      {actionMsg && (
        <div className="alert alert-success alert-dismissible fade show py-2 px-3 small d-flex align-items-center gap-2 mb-4" role="alert">
          <i className="bi bi-check-circle-fill"></i>
          <div>{actionMsg}</div>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="row g-3 mb-4">
        {/* Team Size */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">Team Members</span>
              <div className="stat-icon-wrapper stat-icon-indigo">
                <i className="bi bi-people-fill"></i>
              </div>
            </div>
            <div className="fs-3 fw-bold text-dark">{stats.teamCount || 0}</div>
            <div className="text-muted small mt-2">Active in your department</div>
          </div>
        </div>

        {/* Team Attendance Today */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">Team Present</span>
              <div className="stat-icon-wrapper stat-icon-emerald">
                <i className="bi bi-person-check-fill"></i>
              </div>
            </div>
            <div className="d-flex align-items-baseline gap-2">
              <div className="fs-3 fw-bold text-dark">{stats.teamAttendanceRate || 0}%</div>
              <span className="text-secondary small">
                ({stats.teamPresent || 0} of {stats.teamCount || 0})
              </span>
            </div>
            <div className="d-flex align-items-center gap-2 mt-2" style={{ fontSize: '0.75rem' }}>
              <span className="text-warning fw-medium">● {stats.teamLate || 0} Late</span>
              <span className="text-danger fw-medium">● {stats.teamAbsent || 0} Absent</span>
            </div>
          </div>
        </div>

        {/* Team Pending Leaves */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">Pending Leaves</span>
              <div className="stat-icon-wrapper stat-icon-amber">
                <i className="bi bi-envelope-exclamation-fill"></i>
              </div>
            </div>
            <div className="fs-3 fw-bold text-dark">{stats.pendingLeavesCount || 0}</div>
            <div className="text-muted small mt-2">Awaiting your approval</div>
          </div>
        </div>

        {/* Team Training Progress */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">Training Status</span>
              <div className="stat-icon-wrapper stat-icon-blue">
                <i className="bi bi-mortarboard-fill"></i>
              </div>
            </div>
            <div className="fs-3 fw-bold text-dark">{stats.teamEnrolledCount || 0}</div>
            <div className="text-success small fw-medium mt-2">
              {stats.teamCompletedCount || 0} completed certifications
            </div>
          </div>
        </div>
      </div>

      {/* Row: Team Leave Approvals & Team Roster */}
      <div className="row g-3">
        {/* Pending Leave Requests */}
        <div className="col-12 col-lg-7">
          <div className="staff-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="fw-bold text-dark mb-0">Team Leave Requests</h6>
                <span className="text-secondary small">Direct reviews for team members</span>
              </div>
              <Link to="/leaves" className="text-decoration-none small text-primary fw-semibold">
                Manage All
              </Link>
            </div>

            {teamPendingLeaves.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                <i className="bi bi-calendar2-check fs-3 text-success d-block mb-2"></i>
                No pending leave requests for your team right now.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="staff-table align-middle">
                  <thead>
                    <tr>
                      <th>Team Member</th>
                      <th>Leave Type</th>
                      <th>Duration</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamPendingLeaves.map((leave) => (
                      <tr key={leave._id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <img
                              src={leave.employee?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(leave.employee?.firstName || 'E')}&background=random`}
                              alt=""
                              className="rounded-circle"
                              style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                            />
                            <div>
                              <div className="fw-semibold text-dark small">
                                {leave.employee?.firstName} {leave.employee?.lastName}
                              </div>
                              <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                                {leave.employee?.designation}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border small">
                            {leave.leaveType}
                          </span>
                        </td>
                        <td className="small text-secondary">
                          {leave.daysCount} days
                          <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                            {new Date(leave.startDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-1.5">
                            <button
                              onClick={() => handleReviewLeave(leave._id, 'Approved')}
                              className="btn btn-sm btn-success py-1 px-2.5 small"
                              title="Approve Request"
                            >
                              <i className="bi bi-check-lg"></i>
                            </button>
                            <button
                              onClick={() => handleReviewLeave(leave._id, 'Rejected')}
                              className="btn btn-sm btn-outline-danger py-1 px-2.5 small"
                              title="Reject Request"
                            >
                              <i className="bi bi-x-lg"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Team Members Roster */}
        <div className="col-12 col-lg-5">
          <div className="staff-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="fw-bold text-dark mb-0">My Team Roster</h6>
                <span className="text-secondary small">Direct reports & department colleagues</span>
              </div>
              <Link to="/employees" className="text-decoration-none small text-primary fw-semibold">
                View All
              </Link>
            </div>

            <div className="d-flex flex-column gap-2.5">
              {teamMembers.map((member) => (
                <div key={member._id} className="p-2.5 bg-light rounded-3 d-flex align-items-center justify-content-between border">
                  <div className="d-flex align-items-center gap-2.5">
                    <img
                      src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.firstName)}&background=random`}
                      alt=""
                      className="rounded-circle border"
                      style={{ width: '36px', height: '36px', objectFit: 'cover' }}
                    />
                    <div>
                      <div className="fw-semibold text-dark small">
                        {member.firstName} {member.lastName}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {member.designation} • {member.employeeId}
                      </div>
                    </div>
                  </div>
                  <span className="badge bg-success-subtle text-success border border-success-subtle small">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
