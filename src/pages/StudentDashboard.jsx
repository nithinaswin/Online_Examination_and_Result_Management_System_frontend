import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function StudentDashboard() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await api.get('/api/exams');
      setExams(res.data.data?.content || []);
    } catch (err) {
      setError('Unable to load examinations. Please check server connection.');
    } finally {
      setLoading(false);
    }
  };

  const isWindowActive = (exam) => {
    const now = new Date();
    if (exam.windowStart && new Date(exam.windowStart) > now) return false;
    if (exam.windowEnd && new Date(exam.windowEnd) < now) return false;
    return true;
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '6px' }}>Available Examinations</h1>
        <p style={{ color: 'var(--text-secondary)' }}>View scheduled online tests and start your active exam attempts.</p>
      </div>

      {error && <div className="alert-box alert-danger">{error}</div>}

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>Loading examinations...</div>
      ) : exams.length === 0 ? (
        <div className="card empty-state">
          <h3>No Examinations Available</h3>
          <p>There are no active exams scheduled right now. Check back later!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {exams.map((exam) => {
            const active = isWindowActive(exam);
            const attempted = exam.userAttempted;

            return (
              <div key={exam.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{exam.title}</h3>
                    <span className={`badge ${attempted ? 'badge-info' : active ? 'badge-success' : 'badge-warning'}`}>
                      {attempted ? 'Attempted' : active ? 'Open Now' : 'Upcoming / Expired'}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    {exam.description || 'No specific instructions provided.'}
                  </p>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '20px' }}>
                    <div>⏱ <strong>Duration:</strong> {exam.durationMinutes} minutes</div>
                    <div>🎯 <strong>Total Marks:</strong> {exam.totalMarks} marks (Pass: {exam.passMarks})</div>
                    {exam.windowStart && (
                      <div>📅 <strong>Window:</strong> {new Date(exam.windowStart).toLocaleString()} - {exam.windowEnd ? new Date(exam.windowEnd).toLocaleString() : 'Open'}</div>
                    )}
                  </div>
                </div>

                <div>
                  {attempted ? (
                    <Link to={`/history`} className="btn btn-secondary btn-block">
                      View Results
                    </Link>
                  ) : active ? (
                    <Link to={`/exam/${exam.id}/take`} className="btn btn-primary btn-block">
                      Start Exam
                    </Link>
                  ) : (
                    <button className="btn btn-secondary btn-block" disabled>
                      Window Not Open
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
