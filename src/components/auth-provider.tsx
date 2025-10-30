
'use client';

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, Role } from '@/lib/types';
import { initializeStore, addAuthLog } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

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
    const firstBrace = text.indexOf('{');
    if (firstBrace === -1) {
        return null;
    }

    let braceCount = 0;
    let inString = false;
    let inEscape = false;
    let lastValidChar = -1;

    for (let i = firstBrace; i < text.length; i++) {
        const char = text[i];

        if (inEscape) {
            inEscape = false;
            continue;
        }

        if (char === '"' && !inEscape) {
            inString = !inString;
        }

        if (!inString) {
            if (char === '{') braceCount++;
            else if (char === '}') braceCount--;
        }

        if (braceCount === 0) {
            lastValidChar = i;
            break;
        }
    }

    if (lastValidChar === -1) {
        return null;
    }

    const jsonSubstring = text.substring(firstBrace, lastValidChar + 1);
    try {
        return JSON.parse(jsonSubstring);
    } catch(e) {
        console.error("Final attempt to parse JSON failed", e);
        return null;
    }
};


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

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
      const apiUrl = `/api/login`;
      
      try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY || '',
            },
            body: JSON.stringify({ email, password }),
        });
        
        const responseText = await response.text();
        
        if (!response.ok) {
            const errorMessage = `Server error: ${response.status} ${response.statusText}. Response: ${responseText}`;
            addAuthLog({
                email,
                event: 'Login Failure',
                status: 'Failure',
                details: errorMessage,
            });
          return { success: false, message: `Server error: ${response.statusText}` };
        }
        
        let result;
        try {
            result = parseFirstJson(responseText);
            if (result === null) throw new Error("No valid JSON found in response.");
        } catch (error: any) {
             const errorMessage = `Failed to parse server response: ${error.message}. Response: ${responseText}`;
             addAuthLog({
                email,
                event: 'Login Failure',
                status: 'Failure',
                details: errorMessage,
            });
            return { success: false, message: 'The login service is currently unavailable. Please try again later.' };
        }


        if (result.success && result.data && result.data.user && result.data.token) {
            const apiUser = result.data.user;
            const token = result.data.token;
            
            const roleName = apiUser.role_name || 'Guest';
            const formattedRole = roleName.charAt(0).toUpperCase() + roleName.slice(1);

            const appUser: User = {
                id: apiUser.user_id.toString(),
                user_id: apiUser.user_id,
                name: apiUser.username,
                username: apiUser.username,
                email: apiUser.email,
                role: formattedRole as Role,
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
            
             toast({
                title: 'Login Successful',
                description: 'Welcome back!',
            });
            router.replace('/dashboard');
            return { success: true };
        } else {
             const errorMessage = result.message || 'Invalid credentials provided.';
             addAuthLog({
                email,
                event: 'Login Failure',
                status: 'Failure',
                details: errorMessage,
            });
            return { success: false, message: errorMessage};
        }

      } catch (error) {
        console.error("Login API call failed:", error);
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        addAuthLog({
            email,
            event: 'Login Failure',
            status: 'Failure',
            details: `Failed to connect to the login service. Error: ${message}`,
        });
        return { success: false, message: `Failed to connect to the login service: ${message}` };
      }
    },
    [router, toast]
  );

  const logout = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const apiUrl = `/api/logout`;

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
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) {
              console.error("Server logout failed:", response.statusText);
            }
        } catch (error) {
            console.error("Logout API call failed:", error);
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
