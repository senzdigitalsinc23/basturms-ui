
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

// Helper to find the first valid JSON object in a string
const parseFirstJson = (text: string): any => {
  let firstBrace = text.indexOf('{');
  if (firstBrace === -1) {
    throw new Error("No JSON object found in response");
  }
  
  let braceCount = 0;
  let lastBrace = -1;

  for (let i = firstBrace; i < text.length; i++) {
    if (text[i] === '{') {
      braceCount++;
    } else if (text[i] === '}') {
      braceCount--;
    }

    if (braceCount === 0) {
      lastBrace = i;
      break;
    }
  }

  if (lastBrace === -1) {
    throw new Error("Invalid JSON structure in response");
  }

  const jsonSubstring = text.substring(firstBrace, lastBrace + 1);
  return JSON.parse(jsonSubstring);
};


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
      const apiUrl = '/api/login';
      const apiKey = process.env.NEXT_PUBLIC_API_KEY;

      if (!apiKey) {
        const errorMsg = 'Client-side API configuration is missing.';
        addAuthLog({
            email,
            event: 'Login Failure',
            status: 'Failure',
            details: errorMsg,
        });
        return { success: false, message: errorMsg };
      }
      
      try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': apiKey,
            },
            body: JSON.stringify({ email, password }),
        });
        
        const responseText = await response.text();
        console.log("API Response:", responseText);
        
        if (!response.ok) {
           addAuthLog({
                email,
                event: 'Login Failure',
                status: 'Failure',
                details: `API error: ${response.status} ${response.statusText}`,
            });
          return { success: false, message: `Server error: ${response.statusText}` };
        }
        
        const result = parseFirstJson(responseText);

        if (result.success && result.data && result.data.user_id) {
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

            sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(appUser));
            sessionStorage.setItem(TOKEN_KEY, token);

            addAuthLog({
                email,
                event: 'Login Success',
                status: 'Success',
                details: `User ${email} logged in successfully.`,
            });
            
            router.replace('/dashboard');
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
        if (error instanceof Error) {
            addAuthLog({
                email,
                event: 'Login Failure',
                status: 'Failure',
                details: `Failed to connect to the login service. Error: ${error.message}`,
            });
            return { success: false, message: `Failed to connect to the login service: ${error.message}` };
        }
        addAuthLog({
            email,
            event: 'Login Failure',
            status: 'Failure',
            details: 'Failed to connect to the login service due to an unknown error.',
        });
        return { success: false, message: 'Failed to connect to the login service due to an unknown error.' };
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const apiUrl = '/api/logout';

    if (user) {
      addAuthLog({
        email: user.email,
        event: 'Logout',
        status: 'Success',
        details: `User ${user.email} logged out.`,
      });
    }

    if (token) {
        try {
            await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error("Logout API call failed:", error);
            // We still proceed with local logout even if API call fails
        }
    }
    
    setUser(null);
    localStorage.removeItem(USER_SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);

    sessionStorage.removeItem(USER_SESSION_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    router.push('/login');
  }, [router, user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
