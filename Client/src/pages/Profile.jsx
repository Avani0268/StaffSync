import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('info');

  // Edit Profile Form
  const [profileForm, setProfileForm] = useState({
    phone: '',
    address: '',
    emergencyContact: { name: '', relation: '', phone: '' },
    skills: '',
    avatar: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // Password Form
  const [pwdForm, setPwdForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setProfileForm({
        phone: user.phone || '',
        address: user.address || '',
        emergencyContact: {
          name: user.emergencyContact?.name || '',
          relation: user.emergencyContact?.relation || '',
          phone: user.emergencyContact?.phone || ''
        },
        skills: user.skills ? user.skills.join(', ') : '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg({ type: '', text: '' });

    const payload = {
      phone: profileForm.phone,
      address: profileForm.address,
      emergencyContact: profileForm.emergencyContact,
      skills: profileForm.skills.split(',').map(s => s.trim()).filter(Boolean),
      avatar: profileForm.avatar
    };

    const res = await updateUserProfile(payload);
    setProfileLoading(false);

    if (res.success) {
      setProfileMsg({ type: 'success', text: 'Personal profile details updated successfully!' });
    } else {
      setProfileMsg({ type: 'danger', text: res.message || 'Failed to update profile' });
    }
    setTimeout(() => setProfileMsg({ type: '', text: '' }), 4000);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdMsg({ type: '', text: '' });

    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdMsg({ type: 'danger', text: 'New passwords do not match.' });
      return;
    }

    if (pwdForm.newPassword.length < 6) {
      setPwdMsg({ type: 'danger', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setPwdLoading(true);
    try {
      await API.put('/auth/change-password', {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword
      });
      setPwdMsg({ type: 'success', text: 'Password changed successfully!' });
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwdMsg({ type: 'danger', text: err.response?.data?.message || 'Password update failed' });
    } finally {
      setPwdLoading(false);
      setTimeout(() => setPwdMsg({ type: '', text: '' }), 4000);
    }
  };

  if (!user) return null;

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">My Account & Profile</h2>
        <p className="text-secondary small mb-0">
          Manage your personal contact details, view company records, and update security credentials.
        </p>
      </div>

      <div className="row g-4">
        {/* Left Column: User Summary Card */}
        <div className="col-12 col-lg-4">
          <div className="staff-card p-4 text-center">
            <div className="position-relative d-inline-block mb-3">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'User')}&background=4f46e5&color=fff`}
                alt="Profile Avatar"
                className="rounded-circle border border-3 border-light shadow-sm"
                style={{ width: '96px', height: '96px', objectFit: 'cover' }}
              />
            </div>

            <h5 className="fw-bold text-dark mb-0">{user.fullName || `${user.firstName} ${user.lastName}`}</h5>
            <span className="text-secondary small">{user.designation}</span>

            <div className="d-flex justify-content-center gap-1.5 my-2">
              <span className="badge bg-primary-subtle text-primary border small">{user.employeeId}</span>
              <span className={`badge badge-role-${user.role} small`}>{user.role.toUpperCase()}</span>
            </div>

            <div className="mt-4 pt-3 border-top text-start small d-flex flex-column gap-2 text-secondary">
              <div className="d-flex justify-content-between">
                <span>Department:</span>
                <span className="fw-semibold text-dark">{user.department}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Work Email:</span>
                <span className="fw-semibold text-dark text-truncate" style={{ maxWidth: '170px' }}>{user.email}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Joined Date:</span>
                <span className="fw-semibold text-dark">
                  {new Date(user.dateOfJoining).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Reporting Manager:</span>
                <span className="fw-semibold text-dark">
                  {user.manager ? `${user.manager.firstName} ${user.manager.lastName}` : 'Executive / Direct'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Settings Tabs */}
        <div className="col-12 col-lg-8">
          <div className="staff-card p-4">
            <ul className="nav nav-tabs staff-tabs mb-4">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'info' ? 'active' : ''}`}
                  onClick={() => setActiveTab('info')}
                >
                  <i className="bi bi-person-lines-fill me-1.5"></i>
                  Profile Information
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'security' ? 'active' : ''}`}
                  onClick={() => setActiveTab('security')}
                >
                  <i className="bi bi-shield-lock-fill me-1.5"></i>
                  Security & Password
                </button>
              </li>
            </ul>

            {/* Tab 1: Profile Information */}
            {activeTab === 'info' && (
              <div>
                {profileMsg.text && (
                  <div className={`alert alert-${profileMsg.type} alert-dismissible fade show py-2 px-3 small d-flex align-items-center gap-2 mb-4`} role="alert">
                    <i className="bi bi-info-circle-fill"></i>
                    <div>{profileMsg.text}</div>
                  </div>
                )}

                <form onSubmit={handleProfileSubmit}>
                  {/* Non-editable Company Details */}
                  <h6 className="fw-bold text-dark small text-uppercase mb-3" style={{ letterSpacing: '0.05em' }}>
                    <i className="bi bi-building me-1"></i> Company Assignment (Read-Only)
                  </h6>
                  <div className="row g-2 mb-4 p-3 bg-light rounded-3 small">
                    <div className="col-md-4">
                      <span className="text-secondary">Official ID:</span>
                      <div className="fw-semibold text-dark">{user.employeeId}</div>
                    </div>
                    <div className="col-md-4">
                      <span className="text-secondary">Department:</span>
                      <div className="fw-semibold text-dark">{user.department}</div>
                    </div>
                    <div className="col-md-4">
                      <span className="text-secondary">Designation:</span>
                      <div className="fw-semibold text-dark">{user.designation}</div>
                    </div>
                  </div>

                  {/* Editable Personal Details */}
                  <h6 className="fw-bold text-dark small text-uppercase mb-3" style={{ letterSpacing: '0.05em' }}>
                    <i className="bi bi-pencil-square me-1"></i> Editable Contact & Skills
                  </h6>

                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Contact Phone Number</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="+1 (555) 000-0000"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Avatar Image URL</label>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://..."
                        value={profileForm.avatar}
                        onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Residential / Office Address</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Street, City, State, ZIP"
                        value={profileForm.address}
                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Skills & Expertise (Comma-separated)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="React, Node.js, Leadership, UI Design"
                        value={profileForm.skills}
                        onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <h6 className="fw-bold text-dark small text-uppercase mb-3" style={{ letterSpacing: '0.05em' }}>
                    <i className="bi bi-telephone-plus me-1"></i> Emergency Contact
                  </h6>
                  <div className="row g-2 mb-4">
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Contact Name</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Jane Doe"
                        value={profileForm.emergencyContact.name}
                        onChange={(e) => setProfileForm({
                          ...profileForm,
                          emergencyContact: { ...profileForm.emergencyContact, name: e.target.value }
                        })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Relationship</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Spouse / Parent"
                        value={profileForm.emergencyContact.relation}
                        onChange={(e) => setProfileForm({
                          ...profileForm,
                          emergencyContact: { ...profileForm.emergencyContact, relation: e.target.value }
                        })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Emergency Phone</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="+1 (555) 000-0000"
                        value={profileForm.emergencyContact.phone}
                        onChange={(e) => setProfileForm({
                          ...profileForm,
                          emergencyContact: { ...profileForm.emergencyContact, phone: e.target.value }
                        })}
                      />
                    </div>
                  </div>

                  <div className="text-end">
                    <button type="submit" disabled={profileLoading} className="btn btn-indigo btn-sm py-2 px-4">
                      {profileLoading ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab 2: Security & Password */}
            {activeTab === 'security' && (
              <div>
                {pwdMsg.text && (
                  <div className={`alert alert-${pwdMsg.type} alert-dismissible fade show py-2 px-3 small d-flex align-items-center gap-2 mb-4`} role="alert">
                    <i className="bi bi-shield-check"></i>
                    <div>{pwdMsg.text}</div>
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} style={{ maxWidth: '480px' }}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Current Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      required
                      placeholder="••••••••••••"
                      value={pwdForm.currentPassword}
                      onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">New Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      required
                      placeholder="Minimum 6 characters"
                      value={pwdForm.newPassword}
                      onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-semibold">Confirm New Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      required
                      placeholder="Re-type new password"
                      value={pwdForm.confirmPassword}
                      onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                    />
                  </div>

                  <button type="submit" disabled={pwdLoading} className="btn btn-indigo btn-sm py-2 px-4">
                    {pwdLoading ? 'Updating Password...' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
