import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const Attendance = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';

  const [activeTab, setActiveTab] = useState(isAdmin || isManager ? 'roster' : 'my-history');

  // Today's personal punch status
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [punchLocation, setPunchLocation] = useState('Office HQ');
  const [punchNotes, setPunchNotes] = useState('');
  const [punchLoading, setPunchLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Roster state (Admin/Manager)
  const [rosterDate, setRosterDate] = useState(new Date().toISOString().split('T')[0]);
  const [rosterDept, setRosterDept] = useState('All');
  const [rosterStatus, setRosterStatus] = useState('All');
  const [rosterData, setRosterData] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);

  // My History state
  const [myHistory, setMyHistory] = useState([]);
  const [myStats, setMyStats] = useState({});
  const [historyLoading, setHistoryLoading] = useState(false);

  // Manual Adjustment Modal (Admin)
  const [showManualModal, setShowManualModal] = useState(false);
  const [employeesList, setEmployeesList] = useState([]);
  const [manualForm, setManualForm] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    status: 'Present',
    location: 'Office HQ',
    notes: 'Admin manual entry'
  });

  // Live timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's personal status
  const fetchTodayStatus = async () => {
    try {
      const res = await API.get('/attendance/today');
      setTodayAttendance(res.data.attendance || null);
    } catch (err) {
      console.error('Error fetching today attendance:', err);
    }
  };

  // Fetch Roster
  const fetchRoster = async () => {
    try {
      setRosterLoading(true);
      const params = { date: rosterDate };
      if (rosterDept !== 'All') params.department = rosterDept;
      if (rosterStatus !== 'All') params.status = rosterStatus;

      const res = await API.get('/attendance', { params });
      setRosterData(res.data.attendance || []);
    } catch (err) {
      console.error('Error fetching roster:', err);
    } finally {
      setRosterLoading(false);
    }
  };

  // Fetch My History
  const fetchMyHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await API.get('/attendance/my-history');
      setMyHistory(res.data.history || []);
      setMyStats(res.data.stats || {});
    } catch (err) {
      console.error('Error fetching personal history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayStatus();
    if (isAdmin || isManager) {
      fetchRoster();
    }
    fetchMyHistory();

    if (isAdmin) {
      API.get('/employees').then(res => setEmployeesList(res.data.employees || []));
    }
  }, []);

  useEffect(() => {
    if (isAdmin || isManager) {
      fetchRoster();
    }
  }, [rosterDate, rosterDept, rosterStatus]);

  const handlePunchIn = async () => {
    setPunchLoading(true);
    try {
      const res = await API.post('/attendance/check-in', {
        location: punchLocation,
        notes: punchNotes
      });
      setTodayAttendance(res.data.attendance);
      setToastMsg(res.data.message || 'Punched in successfully!');
      fetchMyHistory();
      if (isAdmin || isManager) fetchRoster();
      setTimeout(() => setToastMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed');
    } finally {
      setPunchLoading(false);
    }
  };

  const handlePunchOut = async () => {
    setPunchLoading(true);
    try {
      const res = await API.post('/attendance/check-out', {});
      setTodayAttendance(res.data.attendance);
      setToastMsg(res.data.message || 'Punched out successfully!');
      fetchMyHistory();
      if (isAdmin || isManager) fetchRoster();
      setTimeout(() => setToastMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Check-out failed');
    } finally {
      setPunchLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/attendance/manual', manualForm);
      setShowManualModal(false);
      setToastMsg('Manual attendance record updated successfully!');
      fetchRoster();
      setTimeout(() => setToastMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to adjust attendance');
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Attendance Management</h2>
          <p className="text-secondary small mb-0">
            Real-time digital punch card, shift timestamps, and workforce roster tracking.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowManualModal(true)}
            className="btn btn-outline-secondary btn-sm py-2 px-3 d-flex align-items-center gap-2"
          >
            <i className="bi bi-pencil-square"></i>
            <span>Manual Adjustment</span>
          </button>
        )}
      </div>

      {toastMsg && (
        <div className="alert alert-success alert-dismissible fade show py-2 px-3 small d-flex align-items-center gap-2 mb-4" role="alert">
          <i className="bi bi-check-circle-fill"></i>
          <div>{toastMsg}</div>
        </div>
      )}

      {/* Quick Punch Station Banner */}
      <div className="punch-card-widget mb-4">
        <div className="row align-items-center g-3">
          <div className="col-lg-5">
            <span className="badge bg-white bg-opacity-20 text-white py-1 px-2.5 rounded-pill small mb-2">
              <i className="bi bi-clock-history me-1"></i> Live Shift Station
            </span>
            <div className="display-6 fw-bold text-white mb-1">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-white-50 small">
              {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          <div className="col-lg-7">
            <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-lg-end gap-3">
              {/* Today's Punch Information */}
              <div className="p-3 bg-white bg-opacity-10 rounded-3 text-white small">
                <div className="d-flex align-items-center gap-3">
                  <div>
                    <span className="text-white-50" style={{ fontSize: '0.72rem' }}>PUNCH IN</span>
                    <div className="fw-bold">
                      {todayAttendance?.checkIn
                        ? new Date(todayAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '--:--'}
                    </div>
                  </div>
                  <div className="border-end border-white border-opacity-20" style={{ height: '24px' }}></div>
                  <div>
                    <span className="text-white-50" style={{ fontSize: '0.72rem' }}>PUNCH OUT</span>
                    <div className="fw-bold">
                      {todayAttendance?.checkOut
                        ? new Date(todayAttendance.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '--:--'}
                    </div>
                  </div>
                  <div className="border-end border-white border-opacity-20" style={{ height: '24px' }}></div>
                  <div>
                    <span className="text-white-50" style={{ fontSize: '0.72rem' }}>HOURS</span>
                    <div className="fw-bold text-warning">{todayAttendance?.workHours || 0} hrs</div>
                  </div>
                </div>
              </div>

              {/* Punch Button */}
              <div>
                {!todayAttendance?.checkIn ? (
                  <button
                    onClick={handlePunchIn}
                    disabled={punchLoading}
                    className="btn btn-success py-2.5 px-4 fw-semibold shadow d-flex align-items-center gap-2"
                  >
                    <i className="bi bi-box-arrow-in-right fs-5"></i>
                    <span>{punchLoading ? '...' : 'Punch In Now'}</span>
                  </button>
                ) : !todayAttendance?.checkOut ? (
                  <button
                    onClick={handlePunchOut}
                    disabled={punchLoading}
                    className="btn btn-danger py-2.5 px-4 fw-semibold shadow d-flex align-items-center gap-2"
                  >
                    <i className="bi bi-box-arrow-right fs-5"></i>
                    <span>{punchLoading ? '...' : 'Punch Out Now'}</span>
                  </button>
                ) : (
                  <span className="badge bg-white text-dark py-2 px-3 rounded-pill fw-semibold shadow-sm">
                    <i className="bi bi-check2-all text-success me-1"></i> Shift Complete
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs staff-tabs mb-4">
        {(isAdmin || isManager) && (
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'roster' ? 'active' : ''}`}
              onClick={() => setActiveTab('roster')}
            >
              <i className="bi bi-people-fill me-1.5"></i>
              {isAdmin ? 'Company Attendance Roster' : 'Team Attendance Roster'}
            </button>
          </li>
        )}
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'my-history' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-history')}
          >
            <i className="bi bi-clock-history me-1.5"></i>
            My Attendance History
          </button>
        </li>
      </ul>

      {/* Tab 1: Company / Team Roster */}
      {activeTab === 'roster' && (isAdmin || isManager) && (
        <div>
          {/* Filters Bar */}
          <div className="staff-card p-3 mb-3">
            <div className="row g-2 align-items-center">
              <div className="col-12 col-sm-4 col-md-3">
                <label className="text-secondary small fw-semibold mb-1">Filter Date</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={rosterDate}
                  onChange={(e) => setRosterDate(e.target.value)}
                />
              </div>

              {isAdmin && (
                <div className="col-6 col-sm-4 col-md-3">
                  <label className="text-secondary small fw-semibold mb-1">Department</label>
                  <select
                    className="form-select form-select-sm"
                    value={rosterDept}
                    onChange={(e) => setRosterDept(e.target.value)}
                  >
                    <option value="All">All Departments</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Finance">Finance</option>
                    <option value="Design">Design</option>
                  </select>
                </div>
              )}

              <div className="col-6 col-sm-4 col-md-3">
                <label className="text-secondary small fw-semibold mb-1">Status</label>
                <select
                  className="form-select form-select-sm"
                  value={rosterStatus}
                  onChange={(e) => setRosterStatus(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half-day">Half-day</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              <div className="col-12 col-md-3 text-md-end mt-sm-auto">
                <span className="badge bg-light text-secondary border p-2">
                  Total listed: {rosterData.length}
                </span>
              </div>
            </div>
          </div>

          {/* Roster Table */}
          <div className="staff-card overflow-hidden">
            {rosterLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading roster...</span>
                </div>
              </div>
            ) : rosterData.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-calendar-x fs-1 text-secondary d-block mb-2"></i>
                No attendance records for the selected filters.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="staff-table align-middle">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Check-In</th>
                      <th>Check-Out</th>
                      <th>Work Hours</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rosterData.map((rec) => {
                      const emp = rec.employee || {};
                      const isAbsent = rec.status === 'Absent' || !rec.checkIn;
                      return (
                        <tr key={rec._id}>
                          <td>
                            <div className="d-flex align-items-center gap-2.5">
                              <img
                                src={emp.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.firstName || 'User')}&background=4f46e5&color=fff`}
                                alt=""
                                className="rounded-circle border"
                                style={{ width: '34px', height: '34px', objectFit: 'cover' }}
                              />
                              <div>
                                <div className="fw-semibold text-dark small">
                                  {emp.firstName} {emp.lastName}
                                </div>
                                <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                                  {emp.employeeId}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="small text-secondary">{emp.department}</td>
                          <td className="small">
                            {rec.checkIn ? (
                              <span className="fw-semibold text-dark">
                                {new Date(rec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            ) : (
                              <span className="text-muted">--:--</span>
                            )}
                          </td>
                          <td className="small">
                            {rec.checkOut ? (
                              <span className="fw-semibold text-dark">
                                {new Date(rec.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            ) : (
                              <span className="text-muted">--:--</span>
                            )}
                          </td>
                          <td className="small fw-semibold">
                            {rec.workHours ? `${rec.workHours} hrs` : '--'}
                          </td>
                          <td className="small text-secondary">
                            {rec.location || 'None'}
                          </td>
                          <td>
                            <span className={`badge badge-status-${rec.status.toLowerCase().replace('-', '')} small`}>
                              {rec.status}
                            </span>
                          </td>
                          <td className="small text-muted text-truncate" style={{ maxWidth: '160px' }} title={rec.notes}>
                            {rec.notes || '--'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: My Personal History */}
      {activeTab === 'my-history' && (
        <div>
          {/* Quick Metrics */}
          <div className="row g-3 mb-4">
            <div className="col-6 col-md-3">
              <div className="stat-card">
                <span className="text-secondary small fw-semibold text-uppercase">Days Present</span>
                <div className="fs-3 fw-bold text-success mt-1">{myStats.totalPresent || 0}</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="stat-card">
                <span className="text-secondary small fw-semibold text-uppercase">Late Arrivals</span>
                <div className="fs-3 fw-bold text-warning mt-1">{myStats.totalLate || 0}</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="stat-card">
                <span className="text-secondary small fw-semibold text-uppercase">Half-Days</span>
                <div className="fs-3 fw-bold text-info mt-1">{myStats.totalHalfDay || 0}</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="stat-card">
                <span className="text-secondary small fw-semibold text-uppercase">Total Hours</span>
                <div className="fs-3 fw-bold text-primary mt-1">{myStats.totalHours || 0}</div>
              </div>
            </div>
          </div>

          {/* History Logs Table */}
          <div className="staff-card overflow-hidden">
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0">Recent Attendance Logs</h6>
              <span className="text-muted small">Showing latest {myHistory.length} records</span>
            </div>

            {historyLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading history...</span>
                </div>
              </div>
            ) : myHistory.length === 0 ? (
              <div className="text-center py-5 text-muted">
                No attendance records found.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="staff-table align-middle">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Check-In</th>
                      <th>Check-Out</th>
                      <th>Working Hours</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myHistory.map((item) => (
                      <tr key={item._id}>
                        <td className="fw-semibold text-dark small">
                          {new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="small">
                          {item.checkIn ? new Date(item.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                        </td>
                        <td className="small">
                          {item.checkOut ? new Date(item.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                        </td>
                        <td className="small fw-semibold">
                          {item.workHours ? `${item.workHours} hrs` : '--'}
                        </td>
                        <td className="small text-secondary">{item.location}</td>
                        <td>
                          <span className={`badge badge-status-${item.status.toLowerCase().replace('-', '')} small`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="small text-muted">{item.notes || '--'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Attendance Adjustment Modal (Admin) */}
      {showManualModal && isAdmin && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Manual Attendance Adjustment</h5>
                <button type="button" className="btn-close" onClick={() => setShowManualModal(false)}></button>
              </div>
              <form onSubmit={handleManualSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Select Employee *</label>
                    <select
                      className="form-select"
                      required
                      value={manualForm.employeeId}
                      onChange={(e) => setManualForm({ ...manualForm, employeeId: e.target.value })}
                    >
                      <option value="">-- Choose Employee --</option>
                      {employeesList.map((e) => (
                        <option key={e._id} value={e._id}>
                          {e.firstName} {e.lastName} ({e.employeeId} - {e.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={manualForm.date}
                        onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Status *</label>
                      <select
                        className="form-select"
                        value={manualForm.status}
                        onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}
                      >
                        <option value="Present">Present</option>
                        <option value="Late">Late</option>
                        <option value="Half-day">Half-day</option>
                        <option value="Absent">Absent</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Check-In Time</label>
                      <input
                        type="time"
                        className="form-control"
                        onChange={(e) => {
                          if (e.target.value) {
                            const [h, m] = e.target.value.split(':');
                            const d = new Date(manualForm.date);
                            d.setHours(h, m, 0);
                            setManualForm({ ...manualForm, checkIn: d.toISOString() });
                          }
                        }}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Check-Out Time</label>
                      <input
                        type="time"
                        className="form-control"
                        onChange={(e) => {
                          if (e.target.value) {
                            const [h, m] = e.target.value.split(':');
                            const d = new Date(manualForm.date);
                            d.setHours(h, m, 0);
                            setManualForm({ ...manualForm, checkOut: d.toISOString() });
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Location</label>
                    <select
                      className="form-select"
                      value={manualForm.location}
                      onChange={(e) => setManualForm({ ...manualForm, location: e.target.value })}
                    >
                      <option value="Office HQ">Office HQ</option>
                      <option value="Remote">Remote</option>
                      <option value="Client Site">Client Site</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Adjustment Reason / Notes</label>
                    <input
                      type="text"
                      className="form-control"
                      value={manualForm.notes}
                      onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowManualModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-indigo btn-sm">Save Adjustment</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
