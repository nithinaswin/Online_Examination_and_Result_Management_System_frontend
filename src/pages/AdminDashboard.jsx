import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalExams: 0,
    totalQuestions: 0,
    totalStudents: 0,
    totalAttempts: 0,
    averageScore: 0,
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, logsRes] = await Promise.all([
        api.get('/api/admin/dashboard/stats'),
        api.get('/api/admin/logs/recent'),
      ]);
      setStats(statsRes.data.data || {});
      setRecentLogs(logsRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '700' }}>Administrative Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>System statistics and recent audit logs.</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Students</div>
          <div className="stat-value">{stats.totalStudents}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Examinations</div>
          <div className="stat-value">{stats.totalExams}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Questions</div>
          <div className="stat-value">{stats.totalQuestions}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Attempts</div>
          <div className="stat-value">{stats.totalAttempts}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average Score</div>
          <div className="stat-value">{stats.averageScore}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Activity Logs</h2>
          <Link to="/admin/logs" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '13px' }}>
            View Full Audit Trail
          </Link>
        </div>

        {recentLogs.length === 0 ? (
          <div className="empty-state">
            <h3>No Activity Recorded Yet</h3>
            <p>System activities like signups, logins, and exam submissions will appear here.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Actor Email</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.slice(0, 10).map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                    <td><span className="badge badge-info">{log.action}</span></td>
                    <td>{log.userEmail || 'System'}</td>
                    <td>{log.details}</td>
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
