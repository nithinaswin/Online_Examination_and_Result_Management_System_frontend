import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/api/admin/users?role=STUDENT');
      setStudents(res.data.data?.content || []);
    } catch (err) {
      setError('Unable to fetch students.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedStudent(null);
    setFormData({ fullName: '', email: '', password: '' });
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (student) => {
    setSelectedStudent(student);
    setFormData({ fullName: student.fullName, email: student.email, password: '' });
    setError('');
    setShowModal(true);
  };

  const handleOpenResetPassword = (student) => {
    setSelectedStudent(student);
    setNewPassword('');
    setError('');
    setShowPasswordModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student account?')) return;
    try {
      await api.delete(`/api/admin/users/${id}`);
      fetchStudents();
    } catch (err) {
      alert('Failed to delete student.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (selectedStudent) {
        await api.put(`/api/admin/users/${selectedStudent.id}`, {
          fullName: formData.fullName,
          email: formData.email,
          role: 'STUDENT',
          password: formData.password || null,
        });
      } else {
        await api.post('/api/admin/users', {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: 'STUDENT',
        });
      }
      setShowModal(false);
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving student profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setSubmitting(true);
    try {
      await api.put(`/api/admin/users/${selectedStudent.id}/reset-password`, { newPassword });
      setShowPasswordModal(false);
      alert('Password updated successfully for student.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '700' }}>Manage Students</h1>
          <p style={{ color: 'var(--text-secondary)' }}>View, search, edit, delete, and reset student credentials.</p>
        </div>
        <button onClick={handleOpenCreate} className="btn btn-primary">
          + Add New Student
        </button>
      </div>

      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <input
          type="text"
          className="form-input"
          placeholder="🔍 Search student by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center' }}>Loading students...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="empty-state">
            <h3>No Students Found</h3>
            <p>No students match your query or registered yet.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>College Email</th>
                  <th>Registration Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.fullName}</strong></td>
                    <td>{s.email}</td>
                    <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleOpenResetPassword(s)} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '12px' }}>
                          Reset Password
                        </button>
                        <button onClick={() => handleOpenEdit(s)} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '12px' }}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="btn btn-danger" style={{ padding: '6px 10px', fontSize: '12px' }}>
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

      {/* Modal for Add / Edit */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>
              {selectedStudent ? 'Edit Student' : 'Add New Student'}
            </h3>

            {error && <div className="alert-box alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">College Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              {!selectedStudent && (
                <div className="form-group">
                  <label className="form-label">Initial Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 6 characters"
                    required
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
              Reset Password: {selectedStudent?.fullName}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Set a temporary or new password for this student.
            </p>

            {error && <div className="alert-box alert-danger">{error}</div>}

            <form onSubmit={handleResetPasswordSubmit}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordModal(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
