import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const role = user.role; // 'admin' | 'manager' | 'employee'

  const getNavItems = () => {
    switch (role) {
      case 'admin':
        return [
          {
            section: 'Core Management',
            items: [
              { label: 'Admin Dashboard', path: '/dashboard', icon: 'bi-grid-1x2-fill' },
              { label: 'Employees Directory', path: '/employees', icon: 'bi-people-fill' },
              { label: 'Attendance Tracker', path: '/attendance', icon: 'bi-clock-history' },
              { label: 'Leave Approvals', path: '/leaves', icon: 'bi-calendar2-check-fill' }
            ]
          },
          {
            section: 'Organization & Growth',
            items: [
              { label: 'Announcements', path: '/announcements', icon: 'bi-megaphone-fill' },
              { label: 'Training Programs', path: '/trainings', icon: 'bi-mortarboard-fill' }
            ]
          },
          {
            section: 'Account',
            items: [
              { label: 'My Profile', path: '/profile', icon: 'bi-person-badge-fill' }
            ]
          }
        ];

      case 'manager':
        return [
          {
            section: 'Team Operations',
            items: [
              { label: 'Manager Dashboard', path: '/dashboard', icon: 'bi-speedometer2' },
              { label: 'Team Members', path: '/employees', icon: 'bi-people-fill' },
              { label: 'Team Attendance', path: '/attendance', icon: 'bi-clock-history' },
              { label: 'Review Leave Requests', path: '/leaves', icon: 'bi-calendar-check-fill' }
            ]
          },
          {
            section: 'Development & News',
            items: [
              { label: 'Team Training', path: '/trainings', icon: 'bi-mortarboard-fill' },
              { label: 'Announcements', path: '/announcements', icon: 'bi-megaphone-fill' }
            ]
          },
          {
            section: 'Account',
            items: [
              { label: 'My Profile', path: '/profile', icon: 'bi-person-badge-fill' }
            ]
          }
        ];

      case 'employee':
      default:
        return [
          {
            section: 'Personal Workspace',
            items: [
              { label: 'My Dashboard', path: '/dashboard', icon: 'bi-columns-gap' },
              { label: 'Daily Attendance', path: '/attendance', icon: 'bi-clock-fill' },
              { label: 'My Leave Requests', path: '/leaves', icon: 'bi-calendar-date-fill' }
            ]
          },
          {
            section: 'Company Hub',
            items: [
              { label: 'Announcements', path: '/announcements', icon: 'bi-megaphone-fill' },
              { label: 'Training Center', path: '/trainings', icon: 'bi-journal-code' }
            ]
          },
          {
            section: 'Account',
            items: [
              { label: 'My Profile', path: '/profile', icon: 'bi-person-badge-fill' }
            ]
          }
        ];
    }
  };

  const navSections = getNavItems();

  const getRoleLabel = () => {
    if (role === 'admin') return 'HR Administrator';
    if (role === 'manager') return 'Team Manager';
    return 'Employee';
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div className="sidebar-overlay d-lg-none" onClick={onClose} />
      )}

      <aside
        className={`app-sidebar ${isOpen ? 'show' : ''}`}
        style={{
          transform: isOpen || window.innerWidth >= 992 ? 'translateX(0)' : 'translateX(-100%)'
        }}
      >
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-icon">
            <i className="bi bi-people-fill"></i>
          </div>
          <div className="d-flex flex-column">
            <span className="fw-bold fs-5 text-white tracking-wide" style={{ letterSpacing: '-0.02em' }}>
              Staff<span style={{ color: '#818cf8' }}>Sync</span>
            </span>
            <span className="text-secondary" style={{ fontSize: '0.72rem' }}>
              Enterprise HRMS v1.0
            </span>
          </div>
          {/* Close button for mobile */}
          <button
            className="btn btn-sm btn-link text-white-50 ms-auto d-lg-none p-0"
            onClick={onClose}
          >
            <i className="bi bi-x-lg fs-5"></i>
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="sidebar-nav">
          {navSections.map((sec, idx) => (
            <div key={idx} className="mb-3">
              <div className="nav-section-title">{sec.section}</div>
              {sec.items.map((item, itemIdx) => (
                <NavLink
                  key={itemIdx}
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 992 && onClose) onClose();
                  }}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  <div className="sidebar-link-content">
                    <i className={`bi ${item.icon}`}></i>
                    <span>{item.label}</span>
                  </div>
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* Sidebar Footer User Info */}
        <div className="sidebar-footer">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2 overflow-hidden">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'User')}&background=4f46e5&color=fff`}
                alt="Avatar"
                className="rounded-circle border border-secondary"
                style={{ width: '36px', height: '36px', objectFit: 'cover' }}
              />
              <div className="d-flex flex-column text-truncate" style={{ maxWidth: '130px' }}>
                <span className="text-white fw-semibold small text-truncate">
                  {user.fullName || `${user.firstName} ${user.lastName}`}
                </span>
                <span className="text-secondary" style={{ fontSize: '0.7rem' }}>
                  {getRoleLabel()}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="btn btn-sm btn-outline-danger border-0 p-1 rounded-circle"
              title="Sign Out"
            >
              <i className="bi bi-box-arrow-right fs-5"></i>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
