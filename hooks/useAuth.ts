import { useState, useEffect } from 'react';
import { User } from '../types';
import { getCurrentUser, logout as authLogout } from '../lib/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkUser = () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  };

  useEffect(() => {
    checkUser();
    
    // Listen for storage events (in case of multi-tab logout)
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  const logout = async () => {
    await authLogout();
    setUser(null);
  };

  const refreshUser = () => {
    checkUser();
  };

  return { user, loading, logout, refreshUser };
};