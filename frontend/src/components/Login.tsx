import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus } from 'lucide-react';

interface ValidationErrors {
  name?: string[];
  email?: string[];
  password?: string[];
  passwordConfirm?: string[];
}

interface ErrorResponse {
  errors: ValidationErrors;
}

// Shape of location.state in React Router
interface LocationState {
  from?: {
    pathname: string;
  };
}

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [genericError, setGenericError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine where to redirect after login/signup
  const state = location.state as LocationState;
  const redirectTo = state?.from?.pathname ?? '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenericError('');
    setFieldErrors({});

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        if (!name) {
          setFieldErrors({ name: ['Name is required'] });
          return;
        }
        if (password !== passwordConfirm) {
          setFieldErrors({ passwordConfirm: ['Passwords do not match'] });
          return;
        }
        await signUp(name, email, password, passwordConfirm);
      }
      // Redirect back to original page
      navigate(redirectTo, { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError<ErrorResponse>;
        const validation = axiosErr.response?.data?.errors;
        if (validation) {
          setFieldErrors(validation);
          return;
        }
        setGenericError(
          axiosErr.response?.data?.errors
            ? JSON.stringify(axiosErr.response.data.errors)
            : axiosErr.message
        );
        return;
      }

      const unknownErr = err as Error;
      setGenericError(unknownErr.message || 'An unexpected error occurred');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8000/api/auth/google';
  };

  return (
    <div className="flex justify-center items-center mt-16">
      <div className="pixel-container w-full max-w-md">
        <h2 className="text-xl mb-6 text-center text-[#7e57c2]">
          {isLogin ? 'Sign In' : 'Create Account'}
        </h2>

        {genericError && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {genericError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm text-[#7e57c2] mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 pixel-border bg-[#f8f0fd]"
              />
              {fieldErrors.name && (
                <p className="text-red-600 text-sm mt-1">{fieldErrors.name[0]}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm text-[#7e57c2] mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 pixel-border bg-[#f8f0fd]"
            />
            {fieldErrors.email && (
              <p className="text-red-600 text-sm mt-1">{fieldErrors.email[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-[#7e57c2] mb-2">Password</label>
            <input
              type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 pixel-border bg-[#f8f0fd]"
              />
            {fieldErrors.password && (
              <p className="text-red-600 text-sm mt-1">{fieldErrors.password[0]}</p>
            )}
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm text-[#7e57c2] mb-2">Confirm Password</label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={e => setPasswordConfirm(e.target.value)}
                className="w-full px-3 py-2 pixel-border bg-[#f8f0fd]"
              />
              {fieldErrors.passwordConfirm && (
                <p className="text-red-600 text-sm mt-1">
                  {fieldErrors.passwordConfirm[0]}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            className="pixel-button primary w-full flex items-center justify-center gap-2 ml-0"
          >
            {isLogin ? (
              <>
                <LogIn size={16} />
                <span>Sign In</span>
              </>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Sign Up</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4">
          <button
            onClick={handleGoogleLogin}
            className="pixel-button secondary w-full flex items-center justify-center gap-2 ml-0"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
            <span>Continue with Google</span>
          </button>
        </div>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-[#7e57c2] mt-4 hover:underline"
        >
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
        </button>
      </div>
    </div>
  );
};

export default Login;
