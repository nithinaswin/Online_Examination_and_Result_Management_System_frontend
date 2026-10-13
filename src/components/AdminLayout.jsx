import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          ⚡ Exam Admin
        </div>
        <nav className="admin-nav">
          <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
            <span>📊</span> Dashboard
          </NavLink>
          <NavLink to="/admin/exams" className={({ isActive }) => isActive ? 'active' : ''}>
            <span>📝</span> Manage Exams
          </NavLink>
          <NavLink to="/admin/students" className={({ isActive }) => isActive ? 'active' : ''}>
            <span>👥</span> Manage Students
          </NavLink>
          <NavLink to="/admin/logs" className={({ isActive }) => isActive ? 'active' : ''}>
            <span>📋</span> Activity Logs
          </NavLink>
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid #1e293b', fontSize: '12px', color: '#64748b' }}>
          Role: <strong style={{ color: '#38bdf8' }}>ADMIN</strong>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-secondary)' }}>
            College Examination Control Center
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {user?.fullName || 'Administrator'}
            </span>
            <button onClick={logout} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '13px' }}>
              Sign Out
            </button>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
