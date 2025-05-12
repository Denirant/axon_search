// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useRouter } from 'next/navigation';
import CircularSpinner from '@/components/ui/circularSpinner';

export interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    loginWithVK: () => Promise<void>;
    register: (email: string, password: string, name?: string) => Promise<void>;
    registerWithGoogle: () => Promise<void>;
    registerWithVK: () => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
    updateProfile: (data: { name?: string; image?: string }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState<boolean>(true); // Поменяли на true по умолчанию
	const [initialLoading, setInitialLoading] = useState<boolean>(true);
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);

	const authCheckCounter = useRef(0);

	useEffect(() => {
        const checkAuth = async () => {
			try {
			  // Делаем запрос с уникальным параметром, чтобы обойти кэш
			  const timestamp = new Date().getTime();
			  const response = await fetch(`/api/auth/me?_=${timestamp}`, {
				headers: {
				  'Cache-Control': 'no-cache, no-store, must-revalidate',
				  'Pragma': 'no-cache'
				}
			  });
		  
			  if (response.ok) {
				const data = await response.json();
				setUser(data.user);
			  } else {
				setUser(null);
			  }
			} catch (error) {
			  console.error('Ошибка при проверке аутентификации:', error);
			  setUser(null);
			} finally {
			  setInitialLoading(false);
			  setLoading(false);
			}
		  };
		  

        checkAuth();
        
        // Максимальное время ожидания - 2 секунды
        const timeoutId = setTimeout(() => {
            setInitialLoading(false);
            setLoading(false);
        }, 2000);
        
        return () => clearTimeout(timeoutId);
    }, []);

    // Очистка ошибки
    const clearError = () => {
        setError(null);
    };

    // Авторизация
    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка при входе');
            }

            setUser(data.user);
            
            // Сохраняем в localStorage для быстрой загрузки при обновлении
            localStorage.setItem('axon_user', JSON.stringify(data.user));
            
            router.push('/');
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Произошла ошибка');
        } finally {
            setLoading(false);
        }
    };


    // Авторизация через Google
    const loginWithGoogle = async () => {
        setLoading(true);
        setError(null);

        try {
            window.location.href = '/api/auth/google';
        } catch (error) {
            setError('Произошла ошибка при авторизации через Google');
            setLoading(false);
        }
    };

    // Авторизация через VK
    const loginWithVK = async () => {
        setLoading(true);
        setError(null);

        try {
            window.location.href = '/api/auth/vk';
        } catch (error) {
            setError('Произошла ошибка при авторизации через VK');
            setLoading(false);
        }
    };

    const register = async (email: string, password: string, name?: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, name }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка при регистрации');
            }

            setUser(data.user);
            router.push('/');
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Произошла ошибка');
        } finally {
            setLoading(false);
        }
    };

    const registerWithGoogle = async () => {
        setLoading(true);
        setError(null);

        try {
            window.location.href = '/api/auth/google?mode=register';
        } catch (error) {
            setError('Произошла ошибка при регистрации через Google');
            setLoading(false);
        }
    };

    const registerWithVK = async () => {
        setLoading(true);
        setError(null);

        try {
            window.location.href = '/api/auth/vk?mode=register';
        } catch (error) {
            setError('Произошла ошибка при регистрации через VK');
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);

        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Ошибка при выходе');
            }

            setUser(null);
            
            localStorage.removeItem('axon_user');
            
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            
            router.push('/login');
        } catch (error) {
            console.error('Ошибка при выходе:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (data: { name?: string; image?: string }): Promise<boolean> => {
        setLoading(true);

        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Ошибка при обновлении профиля');
            }

            const updatedUser = await response.json();
            setUser((prev) => (prev ? { ...prev, ...updatedUser.user } : null));

            return true;
        } catch (error) {
            console.error('Ошибка при обновлении профиля:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Если идет первоначальная загрузка, показываем заглушку
    if (initialLoading) {
        return (
            <div className="min-w-screen min-h-screen flex items-center justify-center">
                <CircularSpinner />
            </div>
        );
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                login,
                loginWithGoogle,
                loginWithVK,
                register,
                registerWithGoogle,
                registerWithVK,
                logout,
                clearError,
                updateProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth должен использоваться внутри AuthProvider');
    }
    return context;
}
