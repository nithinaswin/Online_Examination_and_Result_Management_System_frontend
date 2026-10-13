import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function AdminAnalytics() {
  const { examId } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [examId]);

  const fetchData = async () => {
    try {
      const [analyticsRes, resultsRes] = await Promise.all([
        api.get(`/api/admin/exams/${examId}/analytics`),
        api.get(`/api/admin/exams/${examId}/results`),
      ]);
      setAnalytics(analyticsRes.data.data);
      setResults(resultsRes.data.data?.content || []);
    } catch (err) {
      setError('Unable to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    const token = localStorage.getItem('exam_token');
    window.open(`${import.meta.env.VITE_API_URL || ''}/api/admin/exams/${examId}/results/export?token=${token}`, '_blank');
  };

  if (loading) return <div className="card" style={{ padding: '40px', textAlign: 'center' }}>Loading analytics...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
            <Link to="/admin/exams" style={{ color: 'var(--primary)', textDecoration: 'none' }}>← Back to Exams</Link>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700' }}>Performance Analytics: {analytics?.examTitle}</h1>
        </div>

        <button onClick={handleExportCsv} className="btn btn-primary">
          📥 Export CSV Results
        </button>
      </div>

      {error && <div className="alert-box alert-danger">{error}</div>}

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Attempts</div>
          <div className="stat-value">{analytics?.totalAttempts}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average Score</div>
          <div className="stat-value">{analytics?.averageScore}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Highest Score</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{analytics?.highestScore}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Lowest Score</div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{analytics?.lowestScore}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pass Rate</div>
          <div className="stat-value">{analytics?.passPercentage}%</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700' }}>Student Submissions</h2>
        </div>

        {results.length === 0 ? (
          <div className="empty-state">
            <h3>No Submissions Yet</h3>
            <p>Students who complete this exam will have their detailed scores displayed here.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Result</th>
                  <th>Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.attemptId}>
                    <td><strong>{r.studentName}</strong></td>
                    <td>{r.studentEmail}</td>
                    <td>{r.score} / {r.totalMarks}</td>
                    <td>{r.percentage?.toFixed(1)}%</td>
                    <td>
                      <span className={`badge ${r.passed ? 'badge-success' : 'badge-danger'}`}>
                        {r.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </td>
                    <td>{new Date(r.submittedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
