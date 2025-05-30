import React, { createContext, useContext, useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

export type User = { id: number; email: string; name?: string };

interface ValidationErrors {
  [field: string]: string[];
}

interface ErrorResponse {
  errors?: ValidationErrors;
  error?: string;
}

type AuthContextType = {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API = axios.create({
  baseURL: 'https://api2.davintanaya.me/api/v2',
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers?.set('Authorization', `Bearer ${token}`);
  return config;
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const externalToken = params.get('token');
    if (externalToken) {
      localStorage.setItem('token', externalToken);
      window.history.replaceState({}, document.title, location.pathname);
    }
    const token = externalToken || localStorage.getItem('token');
    if (token) {
      API.get<User>('/user')
        .then(res => {
          setUser(res.data);
          if (externalToken) navigate('/', { replace: true });
        })
        .catch(() => {
          localStorage.removeItem('token');
        });
    }
  }, [location.pathname, location.search, navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      const res = await API.post<{ token: string }>('/login', { email, password });
      localStorage.setItem('token', res.data.data.token);
      const profile = await API.get<User>('/user');
      setUser(profile.data);
    } catch (err: unknown) {
      handleAxiosError(err);
    }
  };

  const signUp = async (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) => {
    try {
      const res = await API.post<{ token: string; user: User }>('/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
    } catch (err: unknown) {
      handleAxiosError(err);
    }
  };

  const signOut = async () => {
    try {
      await API.post('/logout');
    } catch {
      //ignore
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      navigate('/login', { replace: true });
    }
  };

  const updateUser = async (data: Partial<User>) => {
    try {
      const res = await API.put<User>('/user', data);
      setUser(res.data);
    } catch (err: unknown) {
      handleAxiosError(err);
    }
  };

  function handleAxiosError(err: unknown): never {
    if (axios.isAxiosError(err)) {
      const axiosErr = err as AxiosError<ErrorResponse>;
      const payload = axiosErr.response?.data;
      if (payload?.errors) {
        const firstField = Object.keys(payload.errors)[0];
        const firstMsg = payload.errors[firstField][0];
        throw new Error(firstMsg);
      }
      if (payload?.error) {
        throw new Error(payload.error);
      }
      throw new Error(axiosErr.message);
    }
    throw err as Error;
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
