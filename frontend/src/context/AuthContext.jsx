import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('brunoverse_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('brunoverse_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('brunoverse_token');
      if (storedToken) {
        try {
          const me = await authApi.getCurrentUser();
            const updatedUser = {
            userId: me.userId,
            name: me.name,
            email: me.email,
            role: me.role,
            avatarUrl: me.avatarUrl,
            gender: me.gender,
            address: me.address,
            bio: me.bio,
            token: storedToken
          };
          setUser(updatedUser);
          localStorage.setItem('brunoverse_user', JSON.stringify(updatedUser));
        } catch (err) {
          console.warn('Auth verification failed, session might be invalid or offline:', err);
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const userData = {
      userId: res.userId,
      name: res.name,
      email: res.email,
      role: res.role,
      avatarUrl: res.avatarUrl,
      gender: res.gender,
      address: res.address,
      bio: res.bio,
      token: res.token
    };
    setUser(userData);
    setToken(res.token);
    localStorage.setItem('brunoverse_token', res.token);
    localStorage.setItem('brunoverse_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (formData) => {
    const res = await authApi.register(formData);
    const userData = {
      userId: res.userId,
      name: res.name,
      email: res.email,
      role: res.role,
      avatarUrl: res.avatarUrl,
      gender: res.gender,
      address: res.address,
      bio: res.bio,
      token: res.token
    };
    setUser(userData);
    setToken(res.token);
    localStorage.setItem('brunoverse_token', res.token);
    localStorage.setItem('brunoverse_user', JSON.stringify(userData));
    return userData;
  };

  const loginWithGoogle = async (payload) => {
    const res = await authApi.googleAuth(payload);
    if (res.needsOnboarding) {
      return res;
    }
    const userData = {
      userId: res.userId,
      name: res.name,
      email: res.email,
      role: res.role,
      avatarUrl: res.avatarUrl,
      gender: res.gender,
      address: res.address,
      bio: res.bio,
      token: res.token
    };
    setUser(userData);
    setToken(res.token);
    localStorage.setItem('brunoverse_token', res.token);
    localStorage.setItem('brunoverse_user', JSON.stringify(userData));
    return userData;
  };

  const updateUserProfile = (updatedFields) => {
    setUser(prev => {
      const merged = { ...prev, ...updatedFields };
      localStorage.setItem('brunoverse_user', JSON.stringify(merged));
      return merged;
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('brunoverse_token');
    localStorage.removeItem('brunoverse_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, loginWithGoogle, logout, setUser, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
