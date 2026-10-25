import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [punching, setPunching] = useState(false);
  const [punchMsg, setPunchMsg] = useState('');

  // Clock timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's punch status
  const fetchTodayStatus = async () => {
    try {
      const res = await API.get('/attendance/today');
      if (res.data && res.data.attendance) {
        setTodayAttendance(res.data.attendance);
      } else {
        setTodayAttendance(null);
      }
    } catch (err) {
      console.error('Error fetching today attendance:', err);
    }
  };

  useEffect(() => {
    fetchTodayStatus();
  }, []);

  const handleQuickPunch = async () => {
    setPunching(true);
    setPunchMsg('');
    try {
      if (!todayAttendance || !todayAttendance.checkIn) {
        // Punch IN
        const res = await API.post('/attendance/check-in', { location: 'Office HQ' });
        setTodayAttendance(res.data.attendance);
        setPunchMsg('Checked in!');
      } else if (!todayAttendance.checkOut) {
        // Punch OUT
        const res = await API.post('/attendance/check-out', {});
        setTodayAttendance(res.data.attendance);
        setPunchMsg('Checked out!');
      }
    } catch (err) {
      setPunchMsg(err.response?.data?.message || 'Action failed');
    } finally {
      setPunching(false);
      setTimeout(() => setPunchMsg(''), 3000);
    }
  };

  const getRoleBadge = () => {
    if (user?.role === 'admin') {
      return <span className="badge badge-role-admin px-2.5 py-1.5 rounded-pill"><i className="bi bi-shield-lock-fill me-1"></i>HR Administrator</span>;
    }
    if (user?.role === 'manager') {
      return <span className="badge badge-role-manager px-2.5 py-1.5 rounded-pill"><i className="bi bi-briefcase-fill me-1"></i>Team Manager</span>;
    }
    return <span className="badge badge-role-employee px-2.5 py-1.5 rounded-pill"><i className="bi bi-person-fill me-1"></i>Employee</span>;
  };

  return (
    <header className="app-navbar">
      {/* Left: Mobile Toggle & Welcome */}
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-sm btn-light border d-lg-none"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation"
        >
          <i className="bi bi-list fs-5"></i>
        </button>

        <div className="d-none d-sm-flex flex-column">
          <span className="fw-semibold text-dark fs-6">
            Welcome back, <span className="text-primary">{user?.firstName || 'User'}</span>
          </span>
          <span className="text-secondary small">
            {currentTime.toLocaleDateString(undefined, {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>

      {/* Right: Live Clock, Quick Punch & Profile Dropdown */}
      <div className="d-flex align-items-center gap-3">
        {/* Live Digital Clock */}
        <div className="d-none d-md-flex align-items-center gap-1.5 px-3 py-1.5 bg-light rounded-pill border small fw-semibold text-dark">
          <i className="bi bi-clock-history text-primary"></i>
          <span>
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        {/* Role Badge */}
        <div className="d-none d-sm-block">
          {getRoleBadge()}
        </div>

        {/* Quick Punch Button */}
        <div>
          {!todayAttendance || !todayAttendance.checkIn ? (
            <button
              onClick={handleQuickPunch}
              disabled={punching}
              className="btn btn-sm btn-success d-flex align-items-center gap-1.5 fw-semibold px-3 py-1.5 shadow-sm"
              title="Click to Punch In for Today"
            >
              <i className="bi bi-box-arrow-in-right"></i>
              <span>{punching ? '...' : 'Punch In'}</span>
            </button>
          ) : !todayAttendance.checkOut ? (
            <button
              onClick={handleQuickPunch}
              disabled={punching}
              className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1.5 fw-semibold px-3 py-1.5 shadow-sm"
              title="Click to Punch Out for Today"
            >
              <i className="bi bi-box-arrow-right"></i>
              <span>{punching ? '...' : 'Punch Out'}</span>
            </button>
          ) : (
            <span className="badge bg-secondary-subtle text-secondary border px-2.5 py-1.5 rounded-pill small">
              <i className="bi bi-check2-circle text-success me-1"></i>Punched Out ({todayAttendance.workHours}h)
            </span>
          )}
        </div>

        {punchMsg && (
          <span className="badge bg-primary text-white small animate__animated animate__fadeIn">
            {punchMsg}
          </span>
        )}

        {/* Profile Dropdown */}
        <div className="dropdown">
          <button
            className="btn btn-link p-0 text-decoration-none dropdown-toggle d-flex align-items-center gap-2"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=4f46e5&color=fff`}
              alt="Avatar"
              className="rounded-circle border"
              style={{ width: '38px', height: '38px', objectFit: 'cover' }}
            />
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 py-2 mt-2" style={{ borderRadius: '10px', minWidth: '200px' }}>
            <li className="px-3 py-2 border-bottom mb-1">
              <div className="fw-semibold text-dark small">{user?.fullName}</div>
              <div className="text-secondary" style={{ fontSize: '0.75rem' }}>{user?.email}</div>
              <div className="text-muted" style={{ fontSize: '0.7rem' }}>{user?.department} • {user?.employeeId}</div>
            </li>
            <li>
              <Link className="dropdown-item py-2 small d-flex align-items-center gap-2" to="/profile">
                <i className="bi bi-person text-secondary"></i> My Profile
              </Link>
            </li>
            <li>
              <Link className="dropdown-item py-2 small d-flex align-items-center gap-2" to="/attendance">
                <i className="bi bi-clock text-secondary"></i> Attendance Sheet
              </Link>
            </li>
            <li>
              <Link className="dropdown-item py-2 small d-flex align-items-center gap-2" to="/leaves">
                <i className="bi bi-calendar-check text-secondary"></i> My Leaves
              </Link>
            </li>
            <li><hr className="dropdown-divider my-1" /></li>
            <li>
              <button
                onClick={logout}
                className="dropdown-item py-2 small text-danger d-flex align-items-center gap-2"
              >
                <i className="bi bi-box-arrow-right"></i> Sign Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
