import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Music2, Timer, History, Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const toggleMenu = () => setMenuOpen(prev => !prev);

  const navItems = (
    <>
      {user ? (
        <>
          <Link
            to="/"
            className={`pixel-button flex items-center gap-2 ${location.pathname === '/' ? 'primary' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            <Timer size={16} />
            <span>Sessions</span>
          </Link>
          <Link
            to="/history"
            className={`pixel-button flex items-center gap-2 ${location.pathname === '/history' ? 'primary' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            <History size={16} />
            <span>History</span>
          </Link>
          <Link
            to="/music"
            className={`pixel-button flex items-center gap-2 ${location.pathname === '/music' ? 'primary' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            <Music2 size={16} />
            <span>Music</span>
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
        <Link
          to="/login"
          className="pixel-button primary"
          onClick={() => setMenuOpen(false)}
        >
          Sign In
        </Link>
      )}
    </>
  );

  return (
    <nav className="bg-[#f3e5f5] px-6 py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-[#7e57c2] text-lg">
          Pixel Pomodoro
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          {navItems}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden mt-2 flex flex-col space-y-2 px-2">
          {navItems}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
