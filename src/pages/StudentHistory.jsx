import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function StudentHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/api/student/attempts');
      setHistory(res.data.data?.content || []);
    } catch (err) {
      setError('Unable to load attempt history.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '6px' }}>My Results & History</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Review all your previous examination scores and detailed solutions.</p>
      </div>

      {error && <div className="alert-box alert-danger">{error}</div>}

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>Loading your history...</div>
      ) : history.length === 0 ? (
        <div className="card empty-state">
          <h3>No Attempts Found</h3>
          <p>You haven't attempted any examinations yet.</p>
          <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '16px' }}>View Available Exams</Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Exam Title</th>
                  <th>Date Taken</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((att) => (
                  <tr key={att.attemptId}>
                    <td><strong>{att.examTitle}</strong></td>
                    <td>{new Date(att.submittedAt || att.startTime).toLocaleDateString()}</td>
                    <td>{att.score} / {att.totalMarks}</td>
                    <td>{att.percentage != null ? `${att.percentage.toFixed(1)}%` : '--'}</td>
                    <td>
                      <span className={`badge ${att.passed ? 'badge-success' : 'badge-danger'}`}>
                        {att.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </td>
                    <td>
                      <Link to={`/result/${att.attemptId}`} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                        View Solutions
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
