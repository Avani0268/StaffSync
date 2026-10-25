import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const Announcements = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const initialForm = {
    title: '',
    content: '',
    category: 'Company News',
    priority: 'medium',
    isPinned: false,
    targetDepartment: 'All'
  };
  const [formData, setFormData] = useState(initialForm);
  const [modalLoading, setModalLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const params = {};
      if (category !== 'All') params.category = category;
      if (search) params.search = search;

      const res = await API.get('/announcements', { params });
      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAnnouncements();
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setSelectedId(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setIsEditing(true);
    setSelectedId(item._id);
    setFormData({
      title: item.title,
      content: item.content,
      category: item.category,
      priority: item.priority,
      isPinned: item.isPinned,
      targetDepartment: item.targetDepartment
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      if (isEditing) {
        await API.put(`/announcements/${selectedId}`, formData);
        setFeedback('Announcement updated successfully!');
      } else {
        await API.post('/announcements', formData);
        setFeedback('Announcement published successfully!');
      }
      setShowModal(false);
      fetchAnnouncements();
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete announcement "${title}"?`)) return;
    try {
      await API.delete(`/announcements/${id}`);
      setFeedback('Announcement deleted.');
      fetchAnnouncements();
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'urgent':
        return <span className="badge bg-danger-subtle text-danger border border-danger-subtle small">Urgent</span>;
      case 'high':
        return <span className="badge bg-warning-subtle text-warning border border-warning-subtle small">High</span>;
      default:
        return <span className="badge bg-light text-secondary border small">{p}</span>;
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Company Announcements</h2>
          <p className="text-secondary small mb-0">
            Official announcements, policy updates, and corporate notices.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="btn btn-indigo btn-sm py-2 px-3 d-flex align-items-center gap-2 shadow-sm"
          >
            <i className="bi bi-megaphone-fill"></i>
            <span>Publish Announcement</span>
          </button>
        )}
      </div>

      {feedback && (
        <div className="alert alert-success alert-dismissible fade show py-2 px-3 small d-flex align-items-center gap-2 mb-4" role="alert">
          <i className="bi bi-check-circle-fill"></i>
          <div>{feedback}</div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="staff-card p-3 mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-12 col-md-5">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-secondary border-end-0">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search announcements..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-outline-secondary" type="submit">Search</button>
            </div>
          </div>

          <div className="col-6 col-md-4">
            <select
              className="form-select form-select-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Company News">Company News</option>
              <option value="HR Policy">HR Policy</option>
              <option value="Holiday & Events">Holiday & Events</option>
              <option value="Urgent Alert">Urgent Alert</option>
              <option value="General">General</option>
            </select>
          </div>

          <div className="col-6 col-md-3 text-end">
            <span className="badge bg-light text-secondary border p-2 small">
              Total: {announcements.length}
            </span>
          </div>
        </form>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading announcements...</span>
          </div>
        </div>
      ) : announcements.length === 0 ? (
        <div className="staff-card p-5 text-center text-muted">
          <i className="bi bi-megaphone fs-1 text-secondary d-block mb-2"></i>
          No announcements match the selected filters.
        </div>
      ) : (
        <div className="row g-3">
          {announcements.map((item) => (
            <div key={item._id} className="col-12">
              <div
                className={`staff-card p-4 position-relative ${item.isPinned ? 'border-primary' : ''}`}
                style={item.isPinned ? { borderLeft: '4px solid #4f46e5' } : {}}
              >
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start gap-2 mb-2">
                  <div className="d-flex flex-wrap align-items-center gap-2">
                    {item.isPinned && (
                      <span className="badge bg-primary text-white small">
                        <i className="bi bi-pin-angle-fill me-1"></i> Pinned
                      </span>
                    )}
                    <span className="badge bg-primary-subtle text-primary small">
                      {item.category}
                    </span>
                    <span className="badge bg-light text-secondary border small">
                      <i className="bi bi-building me-1"></i> {item.targetDepartment}
                    </span>
                    {getPriorityBadge(item.priority)}
                  </div>

                  {isAdmin && (
                    <div className="d-flex gap-1.5 align-self-end align-self-sm-auto">
                      <button
                        onClick={() => openEditModal(item)}
                        className="btn btn-sm btn-light border p-1 px-2 text-primary"
                        title="Edit Announcement"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(item._id, item.title)}
                        className="btn btn-sm btn-light border p-1 px-2 text-danger"
                        title="Delete Announcement"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  )}
                </div>

                <h5 className="fw-bold text-dark mb-2">{item.title}</h5>
                <p className="text-secondary small mb-3" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                  {item.content}
                </p>

                <div className="d-flex align-items-center justify-content-between pt-2 border-top text-muted small" style={{ fontSize: '0.78rem' }}>
                  <div className="d-flex align-items-center gap-1.5">
                    <i className="bi bi-person-circle"></i>
                    <span>
                      Posted by {item.author?.firstName} {item.author?.lastName} ({item.author?.designation || 'HR'})
                    </span>
                  </div>
                  <div>
                    <i className="bi bi-calendar3 me-1"></i>
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal (Admin) */}
      {showModal && isAdmin && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {isEditing ? 'Edit Announcement' : 'Publish New Announcement'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Annual Company Town Hall 2026"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Category *</label>
                      <select
                        className="form-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="Company News">Company News</option>
                        <option value="HR Policy">HR Policy</option>
                        <option value="Holiday & Events">Holiday & Events</option>
                        <option value="Urgent Alert">Urgent Alert</option>
                        <option value="General">General</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Priority</label>
                      <select
                        className="form-select"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Target Audience</label>
                      <select
                        className="form-select"
                        value={formData.targetDepartment}
                        onChange={(e) => setFormData({ ...formData, targetDepartment: e.target.value })}
                      >
                        <option value="All">All Company</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Sales">Sales</option>
                        <option value="Finance">Finance</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="pinToggle"
                        checked={formData.isPinned}
                        onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                      />
                      <label className="form-check-label small fw-semibold" htmlFor="pinToggle">
                        Pin this announcement to top of feed
                      </label>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Announcement Content *</label>
                    <textarea
                      className="form-control"
                      rows="5"
                      placeholder="Write your announcement details here..."
                      required
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" disabled={modalLoading} className="btn btn-indigo btn-sm">
                    {modalLoading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Publish Now')}
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

export default Announcements;
