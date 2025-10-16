
'use client';

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, Role } from '@/lib/types';
import { initializeStore, addAuthLog } from '@/lib/store';

interface AuthResult {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_SESSION_KEY = 'campusconnect_session';
const TOKEN_KEY = 'campusconnect_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // We still initialize the store for other parts of the app that might use localStorage
    initializeStore();
    try {
      const storedUser = localStorage.getItem(USER_SESSION_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user session from localStorage', error);
      localStorage.removeItem(USER_SESSION_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const apiKey = process.env.NEXT_PUBLIC_API_KEY;

      if (!apiKey) {
        console.error("API Key is not configured in environment variables.");
        addAuthLog({
            email,
            event: 'Login Failure',
            status: 'Failure',
            details: 'Client-side API configuration is missing.',
        });
        return { success: false, message: 'Client-side API configuration is missing.' };
      }
      
      try {
        const response = await fetch(`${apiUrl}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': apiKey,
            },
            body: JSON.stringify({ email, password }),
        });
        
        const result = await response.json();
        
        if (result.success && result.data && result.data.id) {
            const apiUser = result.data;
            const token = result.token;
            
            const appUser: User = {
                id: apiUser.id.toString(),
                user_id: apiUser.user_id,
                name: apiUser.username,
                username: apiUser.username,
                email: apiUser.email,
                role: 'Admin', // Fallback role, will need proper mapping later
                role_id: apiUser.role_id,
                avatarUrl: `https://picsum.photos/seed/${apiUser.username}/40/40`,
                is_super_admin: apiUser.is_super_admin === '1',
                status: apiUser.status as 'active' | 'frozen',
                created_at: apiUser.created_at,
                updated_at: apiUser.updated_at || apiUser.created_at,
            };

            setUser(appUser);
            localStorage.setItem(USER_SESSION_KEY, JSON.stringify(appUser));
            localStorage.setItem(TOKEN_KEY, token);

            addAuthLog({
                email,
                event: 'Login Success',
                status: 'Success',
                details: `User ${email} logged in successfully.`,
            });
            
            router.push('/dashboard');
            return { success: true };
        } else {
             addAuthLog({
                email,
                event: 'Login Failure',
                status: 'Failure',
                details: result.message || 'Invalid credentials provided.',
            });
            return { success: false, message: result.message || 'Invalid credentials provided.'};
        }

      } catch (error) {
        console.error("Login API call failed:", error);
        addAuthLog({
            email,
            event: 'Login Failure',
            status: 'Failure',
            details: 'Failed to connect to the login service.',
        });
        return { success: false, message: 'Failed to connect to the login service.' };
      }
    },
    [router]
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
    localStorage.removeItem(TOKEN_KEY);
    router.push('/login');
  }, [router, user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
