import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function StudentLayout() {
  const { user, logout } = useAuth();

  return (
    <div>
      <nav className="student-navbar">
        <Link to="/dashboard" className="brand">
          🎓 ExamPortal
        </Link>
        <div className="student-nav-links">
          <NavLink to="/dashboard" end className={({ isActive }) => isActive ? 'active' : ''}>
            Exams
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => isActive ? 'active' : ''}>
            My Results
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>
            Profile
          </NavLink>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              {user?.fullName || 'Student'}
            </span>
            <button onClick={logout} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="student-content">
        <Outlet />
      </main>
    </div>
  );
}
