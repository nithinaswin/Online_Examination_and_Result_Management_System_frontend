import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('exam_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('exam_token') || null);
  const [role, setRole] = useState(() => localStorage.getItem('exam_role') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/api/auth/me');
          if (res.data && res.data.data) {
            const userData = res.data.data;
            setUser(userData);
            setRole(userData.role);
            localStorage.setItem('exam_user', JSON.stringify(userData));
            localStorage.setItem('exam_role', userData.role);
          }
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };
    verifyAuth();
  }, [token]);

  const loginStudent = async (email, password) => {
    const res = await api.post('/api/auth/student/login', { email, password });
    const { token: jwt, ...userInfo } = res.data.data;
    localStorage.setItem('exam_token', jwt);
    localStorage.setItem('exam_user', JSON.stringify(userInfo));
    localStorage.setItem('exam_role', userInfo.role);
    setToken(jwt);
    setUser(userInfo);
    setRole(userInfo.role);
    return userInfo;
  };

  const loginAdmin = async (email, password) => {
    const res = await api.post('/api/auth/admin/login', { email, password });
    const { token: jwt, ...userInfo } = res.data.data;
    localStorage.setItem('exam_token', jwt);
    localStorage.setItem('exam_user', JSON.stringify(userInfo));
    localStorage.setItem('exam_role', userInfo.role);
    setToken(jwt);
    setUser(userInfo);
    setRole(userInfo.role);
    return userInfo;
  };

  const registerStudent = async (fullName, email, password) => {
    const res = await api.post('/api/auth/student/signup', { fullName, email, password });
    const { token: jwt, ...userInfo } = res.data.data;
    localStorage.setItem('exam_token', jwt);
    localStorage.setItem('exam_user', JSON.stringify(userInfo));
    localStorage.setItem('exam_role', userInfo.role);
    setToken(jwt);
    setUser(userInfo);
    setRole(userInfo.role);
    return userInfo;
  };

  const logout = () => {
    const currentRole = role;
    localStorage.removeItem('exam_token');
    localStorage.removeItem('exam_user');
    localStorage.removeItem('exam_role');
    setToken(null);
    setUser(null);
    setRole(null);
    if (currentRole === 'ADMIN') {
      window.location.href = '/admin/login';
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      role,
      loading,
      loginStudent,
      loginAdmin,
      registerStudent,
      logout,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
