import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../contexts/UserContext';
import { Bell, Sun, Moon, User, Settings, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import NotificationHub from '../dashboard/NotificationHub';

const Header = () => {
  const { theme, toggleTheme, setAutoTheme } = useTheme();
  const { user, profile } = useUser();
  const profileImage = user?.user_metadata?.avatar_url || profile?.avatar_url;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-violet-600/95 via-purple-600/95 to-fuchsia-600/95 backdrop-blur-sm border-b border-white/20 z-50">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-white">theCortex</h1>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-white" />
            ) : (
              <Moon className="h-5 w-5 text-white" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <NotificationHub />
          </div>

          {/* Help */}
          <Link
            to="/help"
            className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
            aria-label="Help"
          >
            <HelpCircle className="h-5 w-5 text-white" />
          </Link>

          {/* Settings */}
          <Link
            to="/settings"
            className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5 text-white" />
          </Link>

          {/* User profile */}
          <Link
            to="/profile"
            className="flex items-center space-x-2 p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
            aria-label="User profile"
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="h-8 w-8 rounded-full border border-white/20"
              />
            ) : (
              <div className="h-8 w-8 rounded-full border border-white/20 bg-white/10 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header; 