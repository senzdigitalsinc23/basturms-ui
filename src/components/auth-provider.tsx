'use client';

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types';
import { getUserByEmail, initializeStore, addAuthLog } from '@/lib/store';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_SESSION_KEY = 'campusconnect_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    initializeStore();
    try {
      const storedUser = localStorage.getItem(USER_SESSION_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user session from localStorage', error);
      localStorage.removeItem(USER_SESSION_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      const foundUser = getUserByEmail(email);

      if (foundUser && foundUser.password === password) {
        if (foundUser.status === 'frozen') {
          console.warn(`Login attempt for frozen account: ${email}`);
          addAuthLog({
            email,
            event: 'Login Failure',
            status: 'Failure',
            details: 'Attempted login to a frozen account.',
          });
          return false;
        }
        const { password: _, ...userToStore } = foundUser;
        setUser(userToStore);
        localStorage.setItem(USER_SESSION_KEY, JSON.stringify(userToStore));
        addAuthLog({
          email,
          event: 'Login Success',
          status: 'Success',
          details: `User ${email} logged in successfully.`,
        });
        return true;
      }
      addAuthLog({
        email,
        event: 'Login Failure',
        status: 'Failure',
        details: 'Invalid credentials provided.',
      });
      return false;
    },
    []
  );

  const logout = useCallback(() => {
    if (user) {
      addAuthLog({
        email: user.email,
        event: 'Logout',
        status: 'Success',
        details: `User ${user.email} logged out.`,
      });
    }
    setUser(null);
    localStorage.removeItem(USER_SESSION_KEY);
    router.push('/login');
  }, [router, user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
