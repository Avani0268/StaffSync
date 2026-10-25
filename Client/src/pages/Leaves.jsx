import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const Leaves = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';

  const [activeTab, setActiveTab] = useState(isAdmin || isManager ? 'approvals' : 'my-leaves');

  // Balances & My Leaves
  const [leaveBalances, setLeaveBalances] = useState({ annual: 0, casual: 0, sick: 0 });
  const [myLeaves, setMyLeaves] = useState([]);
  const [myLoading, setMyLoading] = useState(false);

  // Approvals (Admin & Manager)
  const [approvalLeaves, setApprovalLeaves] = useState([]);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Pending');
  const [filterType, setFilterType] = useState('All');

  // Modals
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  // Apply Form
  const [applyForm, setApplyForm] = useState({
    leaveType: 'Annual Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [calculatedDays, setCalculatedDays] = useState(1);
  const [applyLoading, setApplyLoading] = useState(false);

  // Review Form
  const [reviewForm, setReviewForm] = useState({
    status: 'Approved',
    reviewRemarks: ''
  });
  const [reviewLoading, setReviewLoading] = useState(false);

  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

  // Calculate days count dynamically
  useEffect(() => {
    if (applyForm.startDate && applyForm.endDate) {
      const s = new Date(applyForm.startDate);
      const e = new Date(applyForm.endDate);
      if (e >= s) {
        const diff = Math.ceil(Math.abs(e - s) / (1000 * 60 * 60 * 24)) + 1;
        setCalculatedDays(diff);
      } else {
        setCalculatedDays(0);
      }
    }
  }, [applyForm.startDate, applyForm.endDate]);

  // Fetch My Leaves
  const fetchMyLeaves = async () => {
    try {
      setMyLoading(true);
      const res = await API.get('/leaves/my-leaves');
      setMyLeaves(res.data.leaves || []);
      if (res.data.leaveBalances) {
        setLeaveBalances(res.data.leaveBalances);
      }
    } catch (err) {
      console.error('Error fetching my leaves:', err);
    } finally {
      setMyLoading(false);
    }
  };

  // Fetch Approvals
  const fetchApprovals = async () => {
    try {
      setApprovalLoading(true);
      const endpoint = isManager && !isAdmin ? '/leaves/team-leaves' : '/leaves';
      const params = {};
      if (filterStatus !== 'All') params.status = filterStatus;
      if (filterType !== 'All') params.leaveType = filterType;

      const res = await API.get(endpoint, { params });
      setApprovalLeaves(res.data.leaves || []);
    } catch (err) {
      console.error('Error fetching leave approvals:', err);
    } finally {
      setApprovalLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLeaves();
    if (isAdmin || isManager) {
      fetchApprovals();
    }
  }, []);

  useEffect(() => {
    if (isAdmin || isManager) {
      fetchApprovals();
    }
  }, [filterStatus, filterType]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (calculatedDays <= 0) {
      alert('End date cannot be earlier than start date.');
      return;
    }

    setApplyLoading(true);
    try {
      const res = await API.post('/leaves', applyForm);
      setShowApplyModal(false);
      setFeedbackMsg({ type: 'success', text: 'Leave application submitted successfully!' });
      setApplyForm({ leaveType: 'Annual Leave', startDate: '', endDate: '', reason: '' });
      fetchMyLeaves();
      if (isAdmin || isManager) fetchApprovals();
      setTimeout(() => setFeedbackMsg({ type: '', text: '' }), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setApplyLoading(false);
    }
  };

  const handleCancelLeave = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this pending leave request?')) return;
    try {
      await API.put(`/leaves/${id}/cancel`);
      setFeedbackMsg({ type: 'success', text: 'Leave request cancelled.' });
      fetchMyLeaves();
      if (isAdmin || isManager) fetchApprovals();
      setTimeout(() => setFeedbackMsg({ type: '', text: '' }), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed');
    }
  };

  const openReviewModal = (leave) => {
    setSelectedLeave(leave);
    setReviewForm({ status: 'Approved', reviewRemarks: '' });
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLeave) return;

    setReviewLoading(true);
    try {
      await API.put(`/leaves/${selectedLeave._id}/review`, reviewForm);
      setShowReviewModal(false);
      setFeedbackMsg({
        type: 'success',
        text: `Leave request for ${selectedLeave.employee?.firstName} marked as ${reviewForm.status}!`
      });
      fetchApprovals();
      fetchMyLeaves();
      setTimeout(() => setFeedbackMsg({ type: '', text: '' }), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Review failed');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Leave Management</h2>
          <p className="text-secondary small mb-0">
            Apply for leave, track application status, and review team requests.
          </p>
        </div>
        <button
          onClick={() => setShowApplyModal(true)}
          className="btn btn-indigo btn-sm py-2 px-3 d-flex align-items-center gap-2 shadow-sm"
        >
          <i className="bi bi-calendar-plus-fill"></i>
          <span>Apply for Leave</span>
        </button>
      </div>

      {feedbackMsg.text && (
        <div className={`alert alert-${feedbackMsg.type} alert-dismissible fade show py-2 px-3 small d-flex align-items-center gap-2 mb-4`} role="alert">
          <i className="bi bi-check-circle-fill"></i>
          <div>{feedbackMsg.text}</div>
        </div>
      )}

      {/* Leave Balances Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">Annual Leave</span>
              <div className="stat-icon-wrapper stat-icon-indigo">
                <i className="bi bi-airplane-fill"></i>
              </div>
            </div>
            <div className="fs-3 fw-bold text-dark">{leaveBalances.annual || 0}</div>
            <span className="text-muted small">Days remaining for personal travel</span>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">Casual Leave</span>
              <div className="stat-icon-wrapper stat-icon-emerald">
                <i className="bi bi-cup-hot-fill"></i>
              </div>
            </div>
            <div className="fs-3 fw-bold text-dark">{leaveBalances.casual || 0}</div>
            <span className="text-muted small">Days remaining for errands/urgent needs</span>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">Sick Leave</span>
              <div className="stat-icon-wrapper stat-icon-rose">
                <i className="bi bi-heart-pulse-fill"></i>
              </div>
            </div>
            <div className="fs-3 fw-bold text-dark">{leaveBalances.sick || 0}</div>
            <span className="text-muted small">Days remaining for medical rest</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs staff-tabs mb-4">
        {(isAdmin || isManager) && (
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'approvals' ? 'active' : ''}`}
              onClick={() => setActiveTab('approvals')}
            >
              <i className="bi bi-shield-check me-1.5"></i>
              {isAdmin ? 'Company Leave Approvals' : 'Team Leave Approvals'}
            </button>
          </li>
        )}
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'my-leaves' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-leaves')}
          >
            <i className="bi bi-calendar-check me-1.5"></i>
            My Leave History
          </button>
        </li>
      </ul>

      {/* Tab: Approvals */}
      {activeTab === 'approvals' && (isAdmin || isManager) && (
        <div>
          {/* Filters Bar */}
          <div className="staff-card p-3 mb-3">
            <div className="row g-2 align-items-center">
              <div className="col-6 col-md-3">
                <label className="text-secondary small fw-semibold mb-1">Status Filter</label>
                <select
                  className="form-select form-select-sm"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="col-6 col-md-3">
                <label className="text-secondary small fw-semibold mb-1">Leave Type</label>
                <select
                  className="form-select form-select-sm"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="All">All Types</option>
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Unpaid Leave">Unpaid Leave</option>
                </select>
              </div>

              <div className="col-12 col-md-6 text-md-end mt-sm-auto">
                <span className="badge bg-light text-secondary border p-2">
                  Total applications: {approvalLeaves.length}
                </span>
              </div>
            </div>
          </div>

          {/* Approvals Table */}
          <div className="staff-card overflow-hidden">
            {approvalLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading leave applications...</span>
                </div>
              </div>
            ) : approvalLeaves.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-check2-all fs-1 text-success d-block mb-2"></i>
                No leave applications match the selected criteria.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="staff-table align-middle">
                  <thead>
                    <tr>
                      <th>Applicant</th>
                      <th>Type & Days</th>
                      <th>Leave Dates</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvalLeaves.map((leave) => {
                      const emp = leave.employee || {};
                      return (
                        <tr key={leave._id}>
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
                                  {emp.department} • {emp.employeeId}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border small">
                              {leave.leaveType}
                            </span>
                            <div className="text-muted small mt-0.5">
                              {leave.daysCount} {leave.daysCount === 1 ? 'day' : 'days'}
                            </div>
                          </td>
                          <td className="small text-secondary">
                            <div>{new Date(leave.startDate).toLocaleDateString()} to</div>
                            <div>{new Date(leave.endDate).toLocaleDateString()}</div>
                          </td>
                          <td className="small text-secondary text-truncate" style={{ maxWidth: '180px' }} title={leave.reason}>
                            {leave.reason}
                          </td>
                          <td>
                            <span className={`badge badge-status-${leave.status.toLowerCase()} small`}>
                              {leave.status}
                            </span>
                            {leave.reviewRemarks && (
                              <div className="text-muted small mt-0.5 text-truncate" style={{ maxWidth: '140px' }} title={leave.reviewRemarks}>
                                Note: {leave.reviewRemarks}
                              </div>
                            )}
                          </td>
                          <td className="text-end">
                            {leave.status === 'Pending' ? (
                              <button
                                onClick={() => openReviewModal(leave)}
                                className="btn btn-sm btn-indigo py-1 px-3"
                              >
                                Review
                              </button>
                            ) : (
                              <span className="text-muted small">
                                Reviewed by {leave.reviewedBy?.firstName || 'HR'}
                              </span>
                            )}
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

      {/* Tab: My Leaves */}
      {activeTab === 'my-leaves' && (
        <div className="staff-card overflow-hidden">
          <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
            <h6 className="fw-bold mb-0">My Leave Applications</h6>
            <span className="text-muted small">Total: {myLeaves.length} applications</span>
          </div>

          {myLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading my leaves...</span>
              </div>
            </div>
          ) : myLeaves.length === 0 ? (
            <div className="text-center py-5 text-muted">
              You haven't submitted any leave requests yet.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="staff-table align-middle">
                <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Duration</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Reviewer Remarks</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myLeaves.map((leave) => (
                    <tr key={leave._id}>
                      <td className="fw-semibold text-dark small">
                        {leave.leaveType}
                      </td>
                      <td className="small text-secondary">
                        {new Date(leave.startDate).toLocaleDateString()}
                      </td>
                      <td className="small text-secondary">
                        {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td className="small fw-semibold">
                        {leave.daysCount} {leave.daysCount === 1 ? 'day' : 'days'}
                      </td>
                      <td className="small text-secondary text-truncate" style={{ maxWidth: '180px' }} title={leave.reason}>
                        {leave.reason}
                      </td>
                      <td>
                        <span className={`badge badge-status-${leave.status.toLowerCase()} small`}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="small text-muted">
                        {leave.reviewRemarks || '--'}
                      </td>
                      <td className="text-end">
                        {leave.status === 'Pending' && (
                          <button
                            onClick={() => handleCancelLeave(leave._id)}
                            className="btn btn-sm btn-outline-danger py-1 px-2.5 small"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Apply for Leave</h5>
                <button type="button" className="btn-close" onClick={() => setShowApplyModal(false)}></button>
              </div>
              <form onSubmit={handleApplySubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Leave Type *</label>
                    <select
                      className="form-select"
                      value={applyForm.leaveType}
                      onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value })}
                    >
                      <option value="Annual Leave">Annual Leave ({leaveBalances.annual || 0} days remaining)</option>
                      <option value="Casual Leave">Casual Leave ({leaveBalances.casual || 0} days remaining)</option>
                      <option value="Sick Leave">Sick Leave ({leaveBalances.sick || 0} days remaining)</option>
                      <option value="Maternity/Paternity Leave">Maternity / Paternity Leave</option>
                      <option value="Unpaid Leave">Unpaid Leave</option>
                    </select>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Start Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={applyForm.startDate}
                        onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">End Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={applyForm.endDate}
                        onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                      />
                    </div>
                  </div>

                  {calculatedDays > 0 && (
                    <div className="alert alert-info py-2 px-3 small d-flex align-items-center justify-content-between mb-3">
                      <span>Total Working Days Requested:</span>
                      <span className="fw-bold fs-6">{calculatedDays} {calculatedDays === 1 ? 'day' : 'days'}</span>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Reason for Leave *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Please describe the purpose of your leave request..."
                      required
                      value={applyForm.reason}
                      onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowApplyModal(false)}>Cancel</button>
                  <button type="submit" disabled={applyLoading} className="btn btn-indigo btn-sm">
                    {applyLoading ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Review Leave Modal (Admin & Manager) */}
      {showReviewModal && selectedLeave && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Review Leave Application</h5>
                <button type="button" className="btn-close" onClick={() => setShowReviewModal(false)}></button>
              </div>
              <form onSubmit={handleReviewSubmit}>
                <div className="modal-body">
                  <div className="p-3 bg-light rounded-3 mb-3 small">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-bold text-dark fs-6">
                        {selectedLeave.employee?.firstName} {selectedLeave.employee?.lastName}
                      </span>
                      <span className="badge bg-primary-subtle text-primary">
                        {selectedLeave.employee?.department}
                      </span>
                    </div>
                    <div className="text-secondary mb-2">
                      {selectedLeave.leaveType} • {selectedLeave.daysCount} days
                    </div>
                    <div className="text-muted">
                      Dates: {new Date(selectedLeave.startDate).toLocaleDateString()} to {new Date(selectedLeave.endDate).toLocaleDateString()}
                    </div>
                    <div className="mt-2 pt-2 border-top">
                      <strong>Reason:</strong> {selectedLeave.reason}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Decision *</label>
                    <div className="d-flex gap-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="reviewDecision"
                          id="decisionApprove"
                          value="Approved"
                          checked={reviewForm.status === 'Approved'}
                          onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
                        />
                        <label className="form-check-label text-success fw-semibold small" htmlFor="decisionApprove">
                          Approve Request
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="reviewDecision"
                          id="decisionReject"
                          value="Rejected"
                          checked={reviewForm.status === 'Rejected'}
                          onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
                        />
                        <label className="form-check-label text-danger fw-semibold small" htmlFor="decisionReject">
                          Reject Request
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Reviewer Remarks</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="e.g. Approved. Enjoy your time off / Team coverage required"
                      value={reviewForm.reviewRemarks}
                      onChange={(e) => setReviewForm({ ...reviewForm, reviewRemarks: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowReviewModal(false)}>Cancel</button>
                  <button type="submit" disabled={reviewLoading} className="btn btn-indigo btn-sm">
                    {reviewLoading ? 'Submitting...' : 'Confirm Decision'}
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

export default Leaves;
