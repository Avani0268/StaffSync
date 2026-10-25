import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const Trainings = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';

  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);

  // Create Form
  const initialForm = {
    title: '',
    description: '',
    category: 'Technical Skills',
    trainer: '',
    startDate: '',
    endDate: '',
    durationHours: 12,
    status: 'Upcoming',
    targetDepartment: 'All'
  };
  const [formData, setFormData] = useState(initialForm);
  const [createLoading, setCreateLoading] = useState(false);

  // Progress Form
  const [progressVal, setProgressVal] = useState(0);
  const [progressFeedback, setProgressFeedback] = useState('');
  const [progressLoading, setProgressLoading] = useState(false);

  const [toastMsg, setToastMsg] = useState('');

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const params = {};
      if (category !== 'All') params.category = category;
      if (status !== 'All') params.status = status;

      const res = await API.get('/trainings', { params });
      setTrainings(res.data.trainings || []);
    } catch (err) {
      console.error('Error fetching trainings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, [category, status]);

  const handleEnroll = async (trainingId) => {
    try {
      await API.post(`/trainings/${trainingId}/enroll`, {});
      setToastMsg('Enrolled successfully! You can now track your learning progress.');
      fetchTrainings();
      setTimeout(() => setToastMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Enrollment failed');
    }
  };

  const openProgressModal = (training) => {
    setSelectedTraining(training);
    setProgressVal(training.myProgress || 0);
    setProgressFeedback('');
    setShowProgressModal(true);
  };

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTraining) return;

    setProgressLoading(true);
    try {
      await API.put(`/trainings/${selectedTraining._id}/progress`, {
        progress: progressVal,
        feedback: progressFeedback
      });
      setShowProgressModal(false);
      setToastMsg('Training progress updated!');
      fetchTrainings();
      setTimeout(() => setToastMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update progress');
    } finally {
      setProgressLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await API.post('/trainings', formData);
      setShowCreateModal(false);
      setToastMsg('Training program created successfully!');
      setFormData(initialForm);
      fetchTrainings();
      setTimeout(() => setToastMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create training program');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete training course "${title}"?`)) return;
    try {
      await API.delete(`/trainings/${id}`);
      setToastMsg('Training course deleted.');
      fetchTrainings();
      setTimeout(() => setToastMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Training & Development</h2>
          <p className="text-secondary small mb-0">
            Professional development programs, certifications, and compliance courses.
          </p>
        </div>
        {(isAdmin || isManager) && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-indigo btn-sm py-2 px-3 d-flex align-items-center gap-2 shadow-sm"
          >
            <i className="bi bi-mortarboard-fill"></i>
            <span>Create Training Program</span>
          </button>
        )}
      </div>

      {toastMsg && (
        <div className="alert alert-success alert-dismissible fade show py-2 px-3 small d-flex align-items-center gap-2 mb-4" role="alert">
          <i className="bi bi-check-circle-fill"></i>
          <div>{toastMsg}</div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="staff-card p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-6 col-md-4">
            <select
              className="form-select form-select-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Technical Skills">Technical Skills</option>
              <option value="Leadership">Leadership</option>
              <option value="Compliance & Safety">Compliance & Safety</option>
              <option value="Soft Skills">Soft Skills</option>
              <option value="Onboarding">Onboarding</option>
            </select>
          </div>

          <div className="col-6 col-md-4">
            <select
              className="form-select form-select-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Upcoming">Upcoming</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="col-12 col-md-4 text-md-end">
            <span className="badge bg-light text-secondary border p-2 small">
              Available Courses: {trainings.length}
            </span>
          </div>
        </div>
      </div>

      {/* Training Courses Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading training programs...</span>
          </div>
        </div>
      ) : trainings.length === 0 ? (
        <div className="staff-card p-5 text-center text-muted">
          <i className="bi bi-mortarboard fs-1 text-secondary d-block mb-2"></i>
          No training programs found for the selected filters.
        </div>
      ) : (
        <div className="row g-3">
          {trainings.map((t) => (
            <div key={t._id} className="col-12 col-md-6 col-xl-4">
              <div className="staff-card p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-primary-subtle text-primary small">
                      {t.category}
                    </span>
                    <span className="badge bg-light text-secondary border small">
                      {t.status}
                    </span>
                  </div>

                  <h5 className="fw-bold text-dark mb-1.5">{t.title}</h5>
                  <p className="text-secondary small mb-3" style={{ lineHeight: '1.5', minHeight: '42px' }}>
                    {t.description}
                  </p>

                  <div className="p-2.5 bg-light rounded-3 small mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Instructor:</span>
                      <span className="fw-semibold text-dark">{t.trainer}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Duration:</span>
                      <span className="fw-semibold text-dark">{t.durationHours} hours</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Enrolled:</span>
                      <span className="fw-semibold text-primary">{t.enrolledCount || 0} participants</span>
                    </div>
                  </div>

                  {/* My Enrollment Status */}
                  {t.isEnrolled && (
                    <div className="mb-3 p-2 rounded-3 border bg-white">
                      <div className="d-flex justify-content-between align-items-center small mb-1">
                        <span className="fw-semibold text-dark">My Progress:</span>
                        <span className="fw-bold text-primary">{t.myProgress}%</span>
                      </div>
                      <div className="progress" style={{ height: '7px', borderRadius: '4px' }}>
                        <div
                          className="progress-bar bg-success"
                          style={{ width: `${t.myProgress}%`, borderRadius: '4px' }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-top d-flex align-items-center justify-content-between">
                  {t.isEnrolled ? (
                    <button
                      onClick={() => openProgressModal(t)}
                      className="btn btn-sm btn-outline-primary w-100 py-1.5"
                    >
                      <i className="bi bi-sliders me-1"></i> Update Progress
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnroll(t._id)}
                      className="btn btn-sm btn-indigo w-100 py-1.5"
                    >
                      <i className="bi bi-box-arrow-in-right me-1"></i> Enroll Now
                    </button>
                  )}

                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(t._id, t.title)}
                      className="btn btn-sm btn-light border text-danger ms-2 px-2.5 py-1.5"
                      title="Delete Course"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Training Modal (Admin & Manager) */}
      {showCreateModal && (isAdmin || isManager) && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Create Training Program</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <form onSubmit={handleCreateSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Course Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Advanced TypeScript & System Architecture"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Category *</label>
                      <select
                        className="form-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="Technical Skills">Technical Skills</option>
                        <option value="Leadership">Leadership</option>
                        <option value="Compliance & Safety">Compliance & Safety</option>
                        <option value="Soft Skills">Soft Skills</option>
                        <option value="Onboarding">Onboarding</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Instructor / Trainer *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Dr. Emily Thorne"
                        required
                        value={formData.trainer}
                        onChange={(e) => setFormData({ ...formData, trainer: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Start Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">End Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Duration (Hours) *</label>
                      <input
                        type="number"
                        className="form-control"
                        required
                        value={formData.durationHours}
                        onChange={(e) => setFormData({ ...formData, durationHours: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Course Description *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Outline course objectives, curriculum, and target outcomes..."
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button type="submit" disabled={createLoading} className="btn btn-indigo btn-sm">
                    {createLoading ? 'Publishing...' : 'Create Course'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Update Progress Modal */}
      {showProgressModal && selectedTraining && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Update Learning Progress</h5>
                <button type="button" className="btn-close" onClick={() => setShowProgressModal(false)}></button>
              </div>
              <form onSubmit={handleProgressSubmit}>
                <div className="modal-body">
                  <div className="mb-2">
                    <span className="fw-semibold text-dark">{selectedTraining.title}</span>
                    <div className="text-muted small">Trainer: {selectedTraining.trainer}</div>
                  </div>

                  <div className="my-4">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label className="form-label small fw-semibold mb-0">Progress Percentage:</label>
                      <span className="fw-bold text-primary fs-5">{progressVal}%</span>
                    </div>
                    <input
                      type="range"
                      className="form-range"
                      min="0"
                      max="100"
                      step="5"
                      value={progressVal}
                      onChange={(e) => setProgressVal(Number(e.target.value))}
                    />
                    <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.72rem' }}>
                      <span>0% Started</span>
                      <span>50% Midpoint</span>
                      <span>100% Completed</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Course Notes / Feedback</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Share what you learned or feedback on the modules..."
                      value={progressFeedback}
                      onChange={(e) => setProgressFeedback(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowProgressModal(false)}>Cancel</button>
                  <button type="submit" disabled={progressLoading} className="btn btn-indigo btn-sm">
                    {progressLoading ? 'Saving...' : 'Save Progress'}
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

export default Trainings;
