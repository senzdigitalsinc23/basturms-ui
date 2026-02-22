
'use client';

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, Role } from '@/lib/types';
import { initializeStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { handleServerResponse, handleApiError } from '@/lib/api-response-handler';

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
    } catch (e) {
        console.error("Final attempt to parse JSON failed", e);
        return null;
    }
};


export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { toast } = useToast();

    const fetchCsrfToken = useCallback(async () => {
        try {
            const response = await fetch('/api/mdware/auth/csrf');
            if (response.ok) {
                const data = await response.json();
                const token = data.csrfToken || data.token || data.csrf_token;
                if (token) {
                    localStorage.setItem('csrf_token', token);
                    sessionStorage.setItem('csrf_token', token);
                }
            } else {
                console.error('Failed to fetch CSRF token:', response.status);
            }
        } catch (error) {
            console.error('Error fetching CSRF token:', error);
        }
    }, []);

    useEffect(() => {
        const initAuth = async () => {
            await fetchCsrfToken();

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
        };

        initAuth();
    }, [fetchCsrfToken]);

    const login = useCallback(
        async (email: string, password: string): Promise<AuthResult> => {
            const apiUrl = '/api/login';

            try {
                console.log('Attempting login to:', apiUrl);

                // Ensure we have a fresh CSRF token before login attempt if one doesn't exist
                if (!localStorage.getItem('csrf_token')) {
                    await fetchCsrfToken();
                }

                const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123'; // Fallback for development
                const csrfToken = localStorage.getItem('csrf_token') || '';

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-KEY': apiKey,
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    body: JSON.stringify({ email, password, user_id: email }),
                });

                const responseText = await response.text();

                if (!response.ok) {
                    let errorMessage = `Server error: ${response.status} ${response.statusText}`;
                    try {
                        const errorData = JSON.parse(responseText);
                        errorMessage = errorData.message || errorMessage;
                    } catch (e) {
                        if (responseText) {
                            errorMessage = responseText;
                        }
                    }

                    toast({
                        title: 'Login Failed',
                        description: errorMessage,
                        variant: 'destructive',
                    });
                    return { success: false, message: errorMessage };
                }

                let result;
                try {
                    result = parseFirstJson(responseText);
                    if (result === null) throw new Error("No valid JSON found in response.");
                } catch (error: any) {
                    const errorMessage = 'The login service is currently unavailable. Please try again later.';
                    toast({
                        title: 'Login Failed',
                        description: errorMessage,
                        variant: 'destructive',
                    });
                    return { success: false, message: errorMessage };
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
                        academic_id: apiUser.academic_id,
                        academic_term: apiUser.term,
                        academic_year: apiUser.academic_year
                    };

                    setUser(appUser);
                    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(appUser));
                    localStorage.setItem(TOKEN_KEY, token);

                    sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(appUser));
                    sessionStorage.setItem(TOKEN_KEY, token);

                    toast({
                        title: 'Login Successful',
                        description: 'Welcome back!',
                    });
                    router.replace('/dashboard');
                    return { success: true };
                } else {
                    const errorMessage = result.message || 'Invalid credentials provided.';
                    toast({
                        title: 'Login Failed',
                        description: errorMessage,
                        variant: 'destructive',
                    });
                    return { success: false, message: errorMessage };
                }

            } catch (error) {
                console.error("Login API call failed:", error);
                const message = error instanceof Error ? error.message : "An unknown error occurred.";
                const errorDetails = error instanceof TypeError && error.message.includes('fetch')
                    ? `Network error: Unable to connect to ${apiUrl}. Please ensure the backend server is running on port 8000.`
                    : `Failed to connect to the login service: ${message}`;
                toast({
                    title: 'Login Failed',
                    description: errorDetails,
                    variant: 'destructive',
                });
                return { success: false, message: errorDetails };
            }
        },
        [router, toast, fetchCsrfToken]
    );

    const logout = useCallback(async () => {
        const token = localStorage.getItem(TOKEN_KEY);
        const apiUrl = '/api/logout';

        if (token && user) {
            try {
                const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-API-KEY': apiKey,
                        'X-User-ID': user.email,
                    }
                });

                const responseText = await response.text();

                if (!response.ok) {
                    console.error("Server logout failed:", response.statusText);
                    try {
                        const errorData = JSON.parse(responseText);
                        toast({
                            title: 'Logout Warning',
                            description: errorData.message || 'Logout failed on server',
                            variant: 'destructive',
                        });
                    } catch {
                        toast({
                            title: 'Logout Warning',
                            description: 'Logout failed on server',
                            variant: 'destructive',
                        });
                    }
                } else {
                    toast({
                        title: 'Logged Out',
                        description: 'You have been logged out successfully',
                    });
                }
            } catch (error) {
                console.error("Logout API call failed:", error);
                toast({
                    title: 'Logout Warning',
                    description: 'Failed to logout from server',
                    variant: 'destructive',
                });
            }
        }

        setUser(null);
        localStorage.removeItem(USER_SESSION_KEY);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('csrf_token');

        sessionStorage.removeItem(USER_SESSION_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem('csrf_token');
        router.push('/login');
    }, [router, user, toast]);

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
