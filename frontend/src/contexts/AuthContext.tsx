'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { User, UserRole, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = useCallback(async (userId: string, password: string, role: UserRole) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(userId, password, role);

      if (response.success && response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        // Set cookie for middleware route protection
        document.cookie = `user=${JSON.stringify({ role: response.user.role })};path=/;max-age=86400`;

        // Redirect based on role
        switch (response.user.role) {
          case UserRole.ADMIN:
            router.push('/admin/dashboard');
            break;
          case UserRole.DEAN:
            router.push('/dean/dashboard');
            break;
          case UserRole.ACTIVITY_HEAD:
            router.push('/activity-head/dashboard');
            break;
          case UserRole.CLUB:
            router.push('/club/dashboard');
            break;
          case UserRole.STUDENT:
            router.push('/student/activities');
            break;
          default:
            router.push('/');
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(() => {
    authAPI.logout();
    setUser(null);
    setToken(null);
    // Clear cookie
    document.cookie = 'user=;path=/;max-age=0';
    router.push('/login');
  }, [router]);

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
