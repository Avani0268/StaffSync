import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await API.get('/dashboard/admin');
      if (res.data && res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleQuickReviewLeave = async (leaveId, status) => {
    try {
      await API.put(`/leaves/${leaveId}/review`, {
        status,
        reviewRemarks: `Quick review by HR Administrator (${status})`
      });
      setActionMsg(`Leave request marked as ${status}!`);
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
          <span className="visually-hidden">Loading Admin Dashboard...</span>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const deptStats = data?.departmentStats || [];
  const recentLeaves = data?.recentLeaves || [];
  const announcements = data?.recentAnnouncements || [];
  const weeklyTrend = data?.weeklyTrend || [];

  return (
    <div className="container-fluid p-0">
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">HR Executive Dashboard</h2>
          <p className="text-secondary small mb-0">
            Real-time workforce monitoring, attendance analytics, and operational metrics.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Link to="/employees" className="btn btn-indigo d-flex align-items-center gap-2 shadow-sm btn-sm py-2 px-3">
            <i className="bi bi-person-plus-fill"></i>
            <span>Add Employee</span>
          </Link>
          <Link to="/announcements" className="btn btn-outline-secondary d-flex align-items-center gap-2 btn-sm py-2 px-3">
            <i className="bi bi-megaphone-fill"></i>
            <span>Announce</span>
          </Link>
        </div>
      </div>

      {actionMsg && (
        <div className="alert alert-success alert-dismissible fade show py-2 px-3 small d-flex align-items-center gap-2 mb-4" role="alert">
          <i className="bi bi-check-circle-fill"></i>
          <div>{actionMsg}</div>
        </div>
      )}

      {/* 4 Core Stat Cards */}
      <div className="row g-3 mb-4">
        {/* Total Workforce */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">Total Workforce</span>
              <div className="stat-icon-wrapper stat-icon-indigo">
                <i className="bi bi-people-fill"></i>
              </div>
            </div>
            <div className="fs-3 fw-bold text-dark">{stats.totalEmployees || 0}</div>
            <div className="d-flex align-items-center gap-1.5 mt-2">
              <span className="badge bg-success-subtle text-success small border border-success-subtle">
                <i className="bi bi-check2"></i> {stats.activeEmployees || 0} Active
              </span>
              <span className="text-muted small">across {deptStats.length} departments</span>
            </div>
          </div>
        </div>

        {/* Attendance Rate Today */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">Attendance Today</span>
              <div className="stat-icon-wrapper stat-icon-emerald">
                <i className="bi bi-calendar2-check-fill"></i>
              </div>
            </div>
            <div className="d-flex align-items-baseline gap-2">
              <div className="fs-3 fw-bold text-dark">{stats.attendanceRate || 0}%</div>
              <span className="text-secondary small">
                ({(stats.presentToday || 0) + (stats.lateToday || 0)} / {stats.activeEmployees || 0})
              </span>
            </div>
            <div className="d-flex align-items-center gap-2 mt-2" style={{ fontSize: '0.75rem' }}>
              <span className="text-success fw-medium">● {stats.presentToday || 0} Present</span>
              <span className="text-warning fw-medium">● {stats.lateToday || 0} Late</span>
              <span className="text-danger fw-medium">● {stats.absentCount || 0} Absent</span>
            </div>
          </div>
        </div>

        {/* Pending Leave Requests */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">Pending Leaves</span>
              <div className="stat-icon-wrapper stat-icon-amber">
                <i className="bi bi-hourglass-split"></i>
              </div>
            </div>
            <div className="fs-3 fw-bold text-dark">{stats.pendingLeavesCount || 0}</div>
            <div className="d-flex align-items-center gap-1.5 mt-2">
              <Link to="/leaves" className="text-decoration-none small text-primary fw-semibold d-flex align-items-center gap-1">
                <span>Review requests</span>
                <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>

        {/* Training Programs */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">Active Trainings</span>
              <div className="stat-icon-wrapper stat-icon-blue">
                <i className="bi bi-mortarboard-fill"></i>
              </div>
            </div>
            <div className="fs-3 fw-bold text-dark">{stats.activeTrainings || 0}</div>
            <div className="d-flex align-items-center gap-1.5 mt-2">
              <span className="text-muted small">Total {stats.totalTrainings || 0} courses created</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row: Weekly Attendance Trends & Department Distribution */}
      <div className="row g-3 mb-4">
        {/* Weekly Attendance Trend */}
        <div className="col-12 col-lg-8">
          <div className="staff-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="fw-bold text-dark mb-0">7-Day Attendance Trajectory</h6>
                <span className="text-secondary small">Daily punches vs absent employees</span>
              </div>
              <span className="badge bg-light text-secondary border small">Weekly View</span>
            </div>

            {/* Custom Interactive Trend Chart */}
            <div className="d-flex align-items-end justify-content-between gap-2 pt-3" style={{ height: '180px' }}>
              {weeklyTrend.map((day, idx) => {
                const total = (day.present || 0) + (day.absent || 0);
                const percent = total > 0 ? Math.round((day.present / total) * 100) : 0;
                const dName = new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' });
                return (
                  <div key={idx} className="d-flex flex-column align-items-center flex-grow-1" style={{ height: '100%' }}>
                    <div className="text-muted small mb-1" style={{ fontSize: '0.72rem' }}>
                      {percent}%
                    </div>
                    <div
                      className="w-100 rounded-3 position-relative overflow-hidden"
                      style={{
                        height: '130px',
                        backgroundColor: '#f1f5f9',
                        display: 'flex',
                        flexDirection: 'column-reverse'
                      }}
                    >
                      <div
                        className="rounded-bottom-3"
                        style={{
                          height: `${Math.max(10, percent)}%`,
                          background: 'linear-gradient(180deg, #4f46e5, #6366f1)',
                          transition: 'height 0.4s ease'
                        }}
                        title={`${day.present} Present on ${day.date}`}
                      />
                    </div>
                    <div className="text-secondary small fw-medium mt-2" style={{ fontSize: '0.75rem' }}>
                      {dName}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="d-flex align-items-center justify-content-center gap-4 mt-3 pt-2 border-top">
              <div className="d-flex align-items-center gap-2 small text-secondary">
                <span className="d-inline-block rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: '#4f46e5' }}></span>
                <span>Present Employees</span>
              </div>
              <div className="d-flex align-items-center gap-2 small text-secondary">
                <span className="d-inline-block rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: '#e2e8f0' }}></span>
                <span>Unlogged / Absent</span>
              </div>
            </div>
          </div>
        </div>

        {/* Department Workforce Breakdown */}
        <div className="col-12 col-lg-4">
          <div className="staff-card p-4 h-100">
            <h6 className="fw-bold text-dark mb-1">Department Workforce</h6>
            <span className="text-secondary small">Staff allocation by department</span>

            <div className="mt-4 d-flex flex-column gap-3">
              {deptStats.map((dept, idx) => {
                const total = stats.totalEmployees || 1;
                const pct = Math.round((dept.count / total) * 100);
                const colors = ['#4f46e5', '#0284c7', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
                const color = colors[idx % colors.length];

                return (
                  <div key={idx}>
                    <div className="d-flex justify-content-between align-items-center small mb-1">
                      <span className="fw-semibold text-dark">{dept._id}</span>
                      <span className="text-secondary">{dept.count} staff ({pct}%)</span>
                    </div>
                    <div className="progress" style={{ height: '7px', borderRadius: '4px', backgroundColor: '#f1f5f9' }}>
                      <div
                        className="progress-bar"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: color,
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Row: Pending Leave Approvals & Company Announcements */}
      <div className="row g-3">
        {/* Pending Leave Requests */}
        <div className="col-12 col-lg-7">
          <div className="staff-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="fw-bold text-dark mb-0">Pending Leave Applications</h6>
                <span className="text-secondary small">Requires HR approval</span>
              </div>
              <Link to="/leaves" className="text-decoration-none small text-primary fw-semibold">
                View All ({recentLeaves.length})
              </Link>
            </div>

            {recentLeaves.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                <i className="bi bi-check-circle fs-3 text-success d-block mb-2"></i>
                All clear! No pending leave requests at this time.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="staff-table align-middle">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Type & Days</th>
                      <th>Reason</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLeaves.map((leave) => (
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
                                {leave.employee?.department}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border small">
                            {leave.leaveType}
                          </span>
                          <div className="text-muted mt-0.5" style={{ fontSize: '0.72rem' }}>
                            {leave.daysCount} {leave.daysCount === 1 ? 'day' : 'days'}
                          </div>
                        </td>
                        <td className="text-truncate small text-secondary" style={{ maxWidth: '180px' }} title={leave.reason}>
                          {leave.reason}
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-1.5">
                            <button
                              onClick={() => handleQuickReviewLeave(leave._id, 'Approved')}
                              className="btn btn-sm btn-success py-1 px-2.5 small"
                              title="Approve Leave"
                            >
                              <i className="bi bi-check-lg"></i> Approve
                            </button>
                            <button
                              onClick={() => handleQuickReviewLeave(leave._id, 'Rejected')}
                              className="btn btn-sm btn-outline-danger py-1 px-2.5 small"
                              title="Reject Leave"
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

        {/* Company Announcements Feed */}
        <div className="col-12 col-lg-5">
          <div className="staff-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="fw-bold text-dark mb-0">Company Announcements</h6>
                <span className="text-secondary small">Latest organizational updates</span>
              </div>
              <Link to="/announcements" className="text-decoration-none small text-primary fw-semibold">
                Manage
              </Link>
            </div>

            <div className="d-flex flex-column gap-3">
              {announcements.map((item) => (
                <div key={item._id} className="p-3 bg-light rounded-3 border">
                  <div className="d-flex align-items-center justify-content-between gap-2 mb-1.5">
                    <span className="badge bg-primary-subtle text-primary small">
                      {item.category}
                    </span>
                    {item.isPinned && (
                      <span className="text-warning small" title="Pinned Announcement">
                        <i className="bi bi-pin-angle-fill"></i> Pinned
                      </span>
                    )}
                  </div>
                  <h6 className="fw-bold text-dark small mb-1">{item.title}</h6>
                  <p className="text-secondary small mb-2 text-truncate" style={{ maxHeight: '42px' }}>
                    {item.content}
                  </p>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                    Posted by {item.author?.firstName} {item.author?.lastName} • {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
