import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';

const EmployeeDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [punching, setPunching] = useState(false);
  const [punchLocation, setPunchLocation] = useState('Office HQ');
  const [punchNotes, setPunchNotes] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await API.get('/dashboard/employee');
      if (res.data && res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error loading employee dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handlePunchIn = async () => {
    setPunching(true);
    try {
      const res = await API.post('/attendance/check-in', {
        location: punchLocation,
        notes: punchNotes
      });
      setActionMsg(res.data.message || 'Punched in successfully!');
      fetchDashboard();
      setTimeout(() => setActionMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed');
    } finally {
      setPunching(false);
    }
  };

  const handlePunchOut = async () => {
    setPunching(true);
    try {
      const res = await API.post('/attendance/check-out', {});
      setActionMsg(res.data.message || 'Punched out successfully!');
      fetchDashboard();
      setTimeout(() => setActionMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Check-out failed');
    } finally {
      setPunching(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Employee Dashboard...</span>
        </div>
      </div>
    );
  }

  const profile = data?.profile || {};
  const todayAtt = data?.todayAttendance;
  const monthly = data?.monthlyStats || {};
  const balances = data?.leaveBalances || { annual: 0, casual: 0, sick: 0 };
  const trainings = data?.myTrainings || [];
  const announcements = data?.announcements || [];

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Employee Workspace</h2>
          <p className="text-secondary small mb-0">
            Track daily attendance, manage leave balances, and explore professional training.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Link to="/leaves" className="btn btn-indigo btn-sm py-2 px-3 d-flex align-items-center gap-2">
            <i className="bi bi-plus-circle"></i>
            <span>Apply for Leave</span>
          </Link>
          <Link to="/trainings" className="btn btn-outline-secondary btn-sm py-2 px-3 d-flex align-items-center gap-2">
            <i className="bi bi-mortarboard"></i>
            <span>Browse Courses</span>
          </Link>
        </div>
      </div>

      {actionMsg && (
        <div className="alert alert-success alert-dismissible fade show py-2 px-3 small d-flex align-items-center gap-2 mb-4" role="alert">
          <i className="bi bi-check-circle-fill"></i>
          <div>{actionMsg}</div>
        </div>
      )}

      {/* Row: Interactive Punch Station & Monthly Attendance Snapshot */}
      <div className="row g-3 mb-4">
        {/* Daily Punch Card Station */}
        <div className="col-12 col-lg-6">
          <div className="punch-card-widget h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="badge bg-white bg-opacity-20 text-white border-0 py-1.5 px-3 rounded-pill small">
                  <i className="bi bi-geo-alt-fill me-1"></i>
                  {todayAtt?.location || 'Punch Station'}
                </span>
                <span className="text-white-50 small">
                  {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
              </div>

              <h4 className="fw-bold text-white mb-2">Today's Attendance Punch</h4>
              <p className="text-white-50 small mb-3">
                Standard shift begins at 09:00 AM. Punching after 09:30 AM marks attendance as Late.
              </p>

              {/* Status details */}
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <div className="p-2.5 rounded-3 bg-white bg-opacity-10">
                    <span className="text-white-50" style={{ fontSize: '0.72rem' }}>PUNCH IN</span>
                    <div className="fw-bold text-white fs-6">
                      {todayAtt?.checkIn
                        ? new Date(todayAtt.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '--:--'}
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-2.5 rounded-3 bg-white bg-opacity-10">
                    <span className="text-white-50" style={{ fontSize: '0.72rem' }}>PUNCH OUT</span>
                    <div className="fw-bold text-white fs-6">
                      {todayAtt?.checkOut
                        ? new Date(todayAtt.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '--:--'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Location & Notes before punch in */}
              {!todayAtt?.checkIn && (
                <div className="row g-2 mb-3">
                  <div className="col-sm-6">
                    <label className="text-white-50 small mb-1" style={{ fontSize: '0.75rem' }}>Work Location</label>
                    <select
                      className="form-select form-select-sm bg-dark text-white border-secondary"
                      value={punchLocation}
                      onChange={(e) => setPunchLocation(e.target.value)}
                    >
                      <option value="Office HQ">Office HQ</option>
                      <option value="Remote">Remote</option>
                      <option value="Client Site">Client Site</option>
                    </select>
                  </div>
                  <div className="col-sm-6">
                    <label className="text-white-50 small mb-1" style={{ fontSize: '0.75rem' }}>Notes (Optional)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-dark text-white border-secondary"
                      placeholder="e.g. Desk 4A"
                      value={punchNotes}
                      onChange={(e) => setPunchNotes(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div>
              {!todayAtt?.checkIn ? (
                <button
                  onClick={handlePunchIn}
                  disabled={punching}
                  className="btn btn-success w-100 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow"
                >
                  <i className="bi bi-box-arrow-in-right fs-5"></i>
                  <span>{punching ? 'Recording Punch...' : 'Punch In for Today'}</span>
                </button>
              ) : !todayAtt?.checkOut ? (
                <button
                  onClick={handlePunchOut}
                  disabled={punching}
                  className="btn btn-danger w-100 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow"
                >
                  <i className="bi bi-box-arrow-right fs-5"></i>
                  <span>{punching ? 'Recording Punch...' : 'Punch Out for Today'}</span>
                </button>
              ) : (
                <div className="p-2.5 rounded-3 bg-success bg-opacity-20 border border-success text-white text-center small fw-semibold">
                  <i className="bi bi-check-circle-fill me-1 text-success"></i>
                  Daily shift completed! Total logged: {todayAtt.workHours} hours.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Monthly Attendance Snapshot */}
        <div className="col-12 col-lg-6">
          <div className="staff-card p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold text-dark mb-0">This Month's Attendance</h6>
                <span className="badge bg-light text-secondary border small">Current Month</span>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-4">
                  <div className="p-3 bg-light rounded-3 text-center border">
                    <span className="text-secondary small">Present</span>
                    <div className="fs-4 fw-bold text-success mt-1">{monthly.daysPresent || 0}</div>
                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>days</span>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-3 bg-light rounded-3 text-center border">
                    <span className="text-secondary small">Late</span>
                    <div className="fs-4 fw-bold text-warning mt-1">{monthly.daysLate || 0}</div>
                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>days</span>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-3 bg-light rounded-3 text-center border">
                    <span className="text-secondary small">Hours</span>
                    <div className="fs-4 fw-bold text-primary mt-1">{monthly.totalHours || 0}</div>
                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>hours</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-3 bg-light border">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small fw-semibold text-secondary">Reporting Manager:</span>
                  <span className="small fw-bold text-dark">
                    {profile.manager ? `${profile.manager.firstName} ${profile.manager.lastName}` : 'Direct HR'}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="small fw-semibold text-secondary">Department:</span>
                  <span className="small text-dark">{profile.department} • {profile.designation}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 text-end">
              <Link to="/attendance" className="btn btn-outline-primary btn-sm">
                View Full Attendance History <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Row: Leave Balance Cards */}
      <h6 className="fw-bold text-dark mb-3">Leave Balances Available</h6>
      <div className="row g-3 mb-4">
        {/* Annual Leave */}
        <div className="col-12 col-md-4">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">Annual Leave</span>
              <div className="stat-icon-wrapper stat-icon-indigo">
                <i className="bi bi-airplane-fill"></i>
              </div>
            </div>
            <div className="fs-3 fw-bold text-dark">{balances.annual || 0}</div>
            <div className="text-muted small mt-2">Days available for vacation</div>
          </div>
        </div>

        {/* Casual Leave */}
        <div className="col-12 col-md-4">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">Casual Leave</span>
              <div className="stat-icon-wrapper stat-icon-emerald">
                <i className="bi bi-cup-hot-fill"></i>
              </div>
            </div>
            <div className="fs-3 fw-bold text-dark">{balances.casual || 0}</div>
            <div className="text-muted small mt-2">Days for personal errands</div>
          </div>
        </div>

        {/* Sick Leave */}
        <div className="col-12 col-md-4">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">Sick Leave</span>
              <div className="stat-icon-wrapper stat-icon-rose">
                <i className="bi bi-heart-pulse-fill"></i>
              </div>
            </div>
            <div className="fs-3 fw-bold text-dark">{balances.sick || 0}</div>
            <div className="text-muted small mt-2">Days for health recuperation</div>
          </div>
        </div>
      </div>

      {/* Row: Enrolled Trainings & Announcements */}
      <div className="row g-3">
        {/* My Enrolled Trainings */}
        <div className="col-12 col-lg-6">
          <div className="staff-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="fw-bold text-dark mb-0">My Training & Skills</h6>
                <span className="text-secondary small">Enrolled courses & certifications</span>
              </div>
              <Link to="/trainings" className="text-decoration-none small text-primary fw-semibold">
                Explore More
              </Link>
            </div>

            {trainings.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                <i className="bi bi-mortarboard fs-3 text-secondary d-block mb-2"></i>
                You are not currently enrolled in any training programs.
                <div className="mt-2">
                  <Link to="/trainings" className="btn btn-sm btn-outline-primary">
                    Browse Catalog
                  </Link>
                </div>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {trainings.map((t) => (
                  <div key={t._id} className="p-3 bg-light rounded-3 border">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-bold text-dark small">{t.title}</span>
                      <span className="badge bg-primary-subtle text-primary small">
                        {t.progress}%
                      </span>
                    </div>
                    <div className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>
                      Trainer: {t.trainer} • {t.category}
                    </div>
                    <div className="progress" style={{ height: '6px', borderRadius: '4px' }}>
                      <div
                        className="progress-bar bg-primary"
                        style={{ width: `${t.progress}%`, borderRadius: '4px' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Announcements */}
        <div className="col-12 col-lg-6">
          <div className="staff-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="fw-bold text-dark mb-0">Company Notice Board</h6>
                <span className="text-secondary small">Important news & HR updates</span>
              </div>
              <Link to="/announcements" className="text-decoration-none small text-primary fw-semibold">
                View All
              </Link>
            </div>

            <div className="d-flex flex-column gap-2.5">
              {announcements.map((item) => (
                <div key={item._id} className="p-3 bg-light rounded-3 border">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span className="badge bg-secondary-subtle text-secondary small">
                      {item.category}
                    </span>
                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h6 className="fw-semibold text-dark small mb-1">{item.title}</h6>
                  <p className="text-secondary small mb-0 text-truncate">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
