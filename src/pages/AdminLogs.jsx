import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/api/admin/logs?size=50');
      setLogs(res.data.data?.content || []);
    } catch (err) {
      setError('Unable to load activity logs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '700' }}>System Activity Logs</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Full audit trail of user logins, registrations, exam updates, and submissions.</p>
      </div>

      {error && <div className="alert-box alert-danger">{error}</div>}

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center' }}>Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <h3>No Audit Logs Recorded</h3>
            <p>Actions performed on the platform will be logged here.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>User / Actor</th>
                  <th>IP Address</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                    <td><span className="badge badge-info">{log.action}</span></td>
                    <td><strong>{log.userEmail || 'System'}</strong></td>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{log.ipAddress || '--'}</td>
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
