import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    // Auto submit
    setLoading(true);
    login(demoEmail, demoPassword).then((result) => {
      setLoading(false);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    });
  };

  return (
    <div className="container-fluid min-vh-100 p-0 d-flex align-items-center justify-content-center bg-light">
      <div className="row g-0 w-100 shadow-lg" style={{ maxWidth: '1100px', borderRadius: '20px', overflow: 'hidden', minHeight: '620px', margin: '1.5rem' }}>
        
        {/* Left Brand Panel */}
        <div
          className="col-lg-6 d-none d-lg-flex flex-column justify-content-between p-5 text-white position-relative"
          style={{
            background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)'
          }}
        >
          <div>
            <div className="d-flex align-items-center gap-2 mb-4">
              <div
                className="d-flex align-items-center justify-content-center rounded-3 text-white"
                style={{ width: '42px', height: '42px', background: '#6366f1', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)' }}
              >
                <i className="bi bi-people-fill fs-4"></i>
              </div>
              <span className="fs-3 fw-bold tracking-tight">
                Staff<span style={{ color: '#818cf8' }}>Sync</span>
              </span>
            </div>

            <h2 className="display-6 fw-bold mb-3" style={{ lineHeight: '1.2' }}>
              Modern Human Resource Management System
            </h2>
            <p className="text-white-50 fs-6 mb-4">
              A centralized, enterprise-grade platform uniting employee management, real-time attendance, automated leave workflows, and team development.
            </p>

            {/* Feature Highlights */}
            <div className="d-flex flex-column gap-3 mt-4">
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 rounded-circle bg-white bg-opacity-10 text-indigo">
                  <i className="bi bi-shield-check text-info fs-5"></i>
                </div>
                <div>
                  <div className="fw-semibold text-white small">Role-Based Access Control</div>
                  <div className="text-white-50" style={{ fontSize: '0.78rem' }}>Tailored dashboards for HR Admins, Managers, and Employees</div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3">
                <div className="p-2 rounded-circle bg-white bg-opacity-10">
                  <i className="bi bi-clock-history text-warning fs-5"></i>
                </div>
                <div>
                  <div className="fw-semibold text-white small">Attendance & Working Hours</div>
                  <div className="text-white-50" style={{ fontSize: '0.78rem' }}>Precise punch-in/out timestamps with automated late detection</div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3">
                <div className="p-2 rounded-circle bg-white bg-opacity-10">
                  <i className="bi bi-mortarboard text-success fs-5"></i>
                </div>
                <div>
                  <div className="fw-semibold text-white small">Leaves & Development Programs</div>
                  <div className="text-white-50" style={{ fontSize: '0.78rem' }}>End-to-end leave approvals and employee skill tracking</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-top border-white border-opacity-10 small text-white-50">
            StaffSync MERN Enterprise • v1.0.0
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="col-lg-6 bg-white p-4 p-sm-5 d-flex flex-column justify-content-center">
          <div className="mb-4">
            <h3 className="fw-bold text-dark mb-1">Welcome Back</h3>
            <p className="text-secondary small">
              Please enter your credentials to access your StaffSync dashboard.
            </p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3" role="alert">
              <i className="bi bi-exclamation-triangle-fill fs-6 flex-shrink-0"></i>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">
                Email Address
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light text-secondary border-end-0">
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  className="form-control border-start-0 ps-0"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center">
                <label className="form-label small fw-semibold text-secondary">
                  Password
                </label>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>Default: Password123!</span>
              </div>
              <div className="input-group">
                <span className="input-group-text bg-light text-secondary border-end-0">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  className="form-control border-start-0 ps-0"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-indigo w-100 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <i className="bi bi-arrow-right"></i>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Switcher */}
          <div className="mt-4 pt-3 border-top">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-semibold">
                <i className="bi bi-lightning-charge-fill text-warning me-1"></i>
                1-Click Quick Demo Login:
              </span>
              <span className="badge bg-light text-secondary border" style={{ fontSize: '0.68rem' }}>Instant fill</span>
            </div>

            <div className="d-grid gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@staffsync.com', 'Password123!')}
                className="btn btn-outline-primary btn-sm text-start d-flex align-items-center justify-content-between py-1.5 px-3"
              >
                <div>
                  <span className="fw-semibold">👑 HR Administrator</span>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>admin@staffsync.com (Full Control)</div>
                </div>
                <i className="bi bi-chevron-right small text-muted"></i>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('manager.eng@staffsync.com', 'Password123!')}
                className="btn btn-outline-dark btn-sm text-start d-flex align-items-center justify-content-between py-1.5 px-3"
              >
                <div>
                  <span className="fw-semibold">👥 Team Manager</span>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>manager.eng@staffsync.com (Engineering Lead)</div>
                </div>
                <i className="bi bi-chevron-right small text-muted"></i>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('alex.turner@staffsync.com', 'Password123!')}
                className="btn btn-outline-success btn-sm text-start d-flex align-items-center justify-content-between py-1.5 px-3"
              >
                <div>
                  <span className="fw-semibold">💼 Senior Employee</span>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>alex.turner@staffsync.com (Engineering Dept)</div>
                </div>
                <i className="bi bi-chevron-right small text-muted"></i>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;
