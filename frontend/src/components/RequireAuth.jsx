import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../lib/api';

const RequireAuth = ({ children, requiredPermission }) => {
  const [status, setStatus] = useState('loading'); // loading | ok | fail
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setStatus('fail');
      return;
    }
    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        if (requiredPermission && !res.data.permissions.includes(requiredPermission)) {
          setStatus('fail');
        } else {
          setStatus('ok');
        }
      })
      .catch(() => setStatus('fail'));
  }, [requiredPermission]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600" data-testid="auth-loading">Verifying access…</p>
      </div>
    );
  }

  if (status === 'fail') return <Navigate to="/admin" replace />;

  return typeof children === 'function' ? children(user) : children;
};

export default RequireAuth;
