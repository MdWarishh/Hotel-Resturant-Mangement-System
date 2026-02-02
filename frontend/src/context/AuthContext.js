// src/context/AuthContext.js
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from '@/services/api';
import { useRouter } from 'next/navigation';
import { USER_ROLES } from '@/utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // const fetchProfile = async () => {
  //   try {
  //     const res = await apiRequest('/auth/me');
  //     setUser(res.data.user);
  //     handleRoleRedirect(res.data.user.role);
  //   } catch (err) {
  //     logout();
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const fetchProfile = async () => {
    try {
      // apiRequest ki jagah api.get use karein
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      // handleRoleRedirect(res.data.user.role); // Isse login page par loop ban sakta hai, dhyan se use karein
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  };


  // const login = async (email, password) => {
  //   const res = await apiRequest('/auth/login', {
  //     method: 'POST',
  //     body: JSON.stringify({ email, password }),
  //   });

  //   localStorage.setItem('token', res.data.token);
  //   setUser(res.data.user);
  //   handleRoleRedirect(res.data.user.role);
  // };


  const login = async (email, password) => {
    // apiRequest ki jagah api.post use karein
    const res = await api.post('/api/auth/login', { email, password });

    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    handleRoleRedirect(res.data.user.role);
  };

  
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  const handleRoleRedirect = (role) => {
    switch (role) {
      case USER_ROLES.SUPER_ADMIN:
        router.push('/super-admin');
        break;
      case USER_ROLES.HOTEL_ADMIN:
        router.push('/hotel-admin');
        break;
      case USER_ROLES.MANAGER:
        router.push('/manager');
        break;
      case USER_ROLES.CASHIER:
        router.push('/cashier');
        break;
      case USER_ROLES.KITCHEN_STAFF:
        router.push('/kitchen');
        break;
      default:
        router.push('/login');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) fetchProfile();
    else setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
