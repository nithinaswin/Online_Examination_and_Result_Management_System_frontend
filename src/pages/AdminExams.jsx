import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function AdminExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    durationMinutes: 30,
    windowStart: '',
    windowEnd: '',
    passMarks: 10,
    active: true,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await api.get('/api/exams/admin');
      setExams(res.data.data?.content || []);
    } catch (err) {
      setError('Unable to fetch exams.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingExam(null);
    setFormData({
      title: '',
      description: '',
      durationMinutes: 30,
      windowStart: '',
      windowEnd: '',
      passMarks: 10,
      active: true,
    });
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (exam) => {
    setEditingExam(exam);
    setFormData({
      title: exam.title,
      description: exam.description || '',
      durationMinutes: exam.durationMinutes,
      windowStart: exam.windowStart ? exam.windowStart.slice(0, 16) : '',
      windowEnd: exam.windowEnd ? exam.windowEnd.slice(0, 16) : '',
      passMarks: exam.passMarks,
      active: exam.active,
    });
    setError('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exam? All associated questions and attempts will be deleted.')) {
      return;
    }
    try {
      await api.delete(`/api/exams/${id}`);
      fetchExams();
    } catch (err) {
      alert('Failed to delete exam.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        windowStart: formData.windowStart ? new Date(formData.windowStart).toISOString() : null,
        windowEnd: formData.windowEnd ? new Date(formData.windowEnd).toISOString() : null,
      };

      if (editingExam) {
        await api.put(`/api/exams/${editingExam.id}`, payload);
      } else {
        await api.post('/api/exams', payload);
      }
      setShowModal(false);
      fetchExams();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving examination.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '700' }}>Manage Examinations</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Create, edit, delete, configure questions, and review analytics.</p>
        </div>
        <button onClick={handleOpenCreate} className="btn btn-primary">
          + Create Examination
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center' }}>Loading examinations...</div>
        ) : exams.length === 0 ? (
          <div className="empty-state">
            <h3>No Examinations Found</h3>
            <p>Click "Create Examination" above to add your first exam.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Duration</th>
                  <th>Total Marks</th>
                  <th>Pass Marks</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam.id}>
                    <td>
                      <strong>{exam.title}</strong>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{exam.description?.slice(0, 60)}</div>
                    </td>
                    <td>{exam.durationMinutes} mins</td>
                    <td>{exam.totalMarks}</td>
                    <td>{exam.passMarks}</td>
                    <td>
                      <span className={`badge ${exam.active ? 'badge-success' : 'badge-danger'}`}>
                        {exam.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link to={`/admin/exams/${exam.id}/questions`} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '12px' }}>
                          Questions
                        </Link>
                        <Link to={`/admin/exams/${exam.id}/analytics`} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '12px' }}>
                          Analytics
                        </Link>
                        <button onClick={() => handleOpenEdit(exam)} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '12px' }}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(exam.id)} className="btn btn-danger" style={{ padding: '6px 10px', fontSize: '12px' }}>
                          Delete
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

      {/* Modal for Create/Edit Exam */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>
              {editingExam ? 'Edit Examination' : 'Create New Examination'}
            </h3>

            {error && <div className="alert-box alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Exam Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Data Structures Midterm 2026"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description / Instructions</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Rules, syllabus, or instructions..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Passing Marks</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={formData.passMarks}
                    onChange={(e) => setFormData({ ...formData, passMarks: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Window Start (Optional)</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={formData.windowStart}
                    onChange={(e) => setFormData({ ...formData, windowStart: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Window End (Optional)</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={formData.windowEnd}
                    onChange={(e) => setFormData({ ...formData, windowEnd: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="examActive"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
                <label htmlFor="examActive" style={{ fontSize: '14px', cursor: 'pointer' }}>
                  Exam is Active and visible to students
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingExam ? 'Update Exam' : 'Create Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
