import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Music2, Timer, History } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-[#f3e5f5] px-6 py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-[#7e57c2] text-lg">
          Pixel Pomodoro
        </Link>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link 
                to="/" 
                className={`pixel-button ${location.pathname === '/' ? 'primary' : ''}`}
              >
                <Timer size={16} />
                <span className="ml-2">Sessions</span>
              </Link>
              <Link 
                to="/history" 
                className={`pixel-button ${location.pathname === '/history' ? 'primary' : ''}`}
              >
                <History size={16} />
                <span className="ml-2">History</span>
              </Link>
              <Link 
                to="/music" 
                className={`pixel-button ${location.pathname === '/music' ? 'primary' : ''}`}
              >
                <Music2 size={16} />
                <span className="ml-2">Music</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="pixel-button flex items-center gap-2"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="pixel-button primary">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;