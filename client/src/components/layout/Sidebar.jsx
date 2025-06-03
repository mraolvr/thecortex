import React, { useState, createContext, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User } from "lucide-react";
import { cn } from "../../utils/cn";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Brain,
  Briefcase,
  Image,
  BookOpen,
  PenTool,
  Lock,
  Settings,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import { routes, bottomRoutes } from '../../routes/routes';
import GlowingEffect from '../ui/GlowingEffect';
import { useUser } from '../../contexts/UserContext';
import CortexLogo from '../ui/CortexLogo';

const SidebarContext = createContext(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarLink = ({ to, icon: Icon, children, isCollapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
        isActive
          ? "bg-neutral-800 text-white shadow-lg"
          : "text-neutral-200 hover:bg-neutral-800 hover:text-white",
        isCollapsed ? 'justify-center px-2' : ''
      )}
    >
      <Icon className={cn(
        "w-5 h-5 relative z-10 transition-transform duration-300",
        isActive ? "scale-110" : "group-hover:scale-110"
      )} />
      {!isCollapsed && <span className="relative z-10 font-medium">{children}</span>}
    </Link>
  );
};

export const SidebarBody = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useUser();

  const profileImage = user?.user_metadata?.avatar_url || profile?.avatar_url;

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isCollapsed && !event.target.closest('.sidebar-content')) {
        setIsCollapsed(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isCollapsed]);

  const SignInButton = () => (
    <button
      onClick={() => navigate('/login')}
      className="flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors duration-200"
    >
      <Lock className="w-4 h-4" />
      <span>Sign In</span>
    </button>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <div className="h-16 px-4 flex items-center justify-between bg-gradient-to-r from-violet-600/95 via-purple-600/95 to-fuchsia-600/95 backdrop-blur-sm border-b border-white/20">
          <span className="text-xl font-semibold text-white">theCortex</span>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 -mr-2 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
            aria-label={isCollapsed ? "Close menu" : "Open menu"}
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
        </div>
        <AnimatePresence>
          {isCollapsed && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="fixed inset-0 bg-gradient-to-br from-violet-900/98 via-purple-900/98 to-fuchsia-900/98 backdrop-blur-sm z-50 p-4 sidebar-content"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="text-xl font-semibold text-white">theCortex</span>
                <button
                  onClick={() => setIsCollapsed(false)}
                  className="p-2 -mr-2 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
              {user ? (
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-20 h-20 rounded-full border-2 border-white/20 shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full border-2 border-white/20 shadow-lg bg-white/10 flex items-center justify-center">
                        <User className="w-10 h-10 text-white/70" />
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/20 via-purple-500/20 to-fuchsia-500/20" />
                  </div>
                </div>
              ) : (
                <div className="flex justify-center mb-6">
                  <SignInButton />
                </div>
              )}
              <nav className="space-y-2 overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar">
                {children}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop Sidebar */}
      <div className={`hidden md:flex flex-col fixed left-0 top-0 h-screen ${isCollapsed ? 'w-[200px]' : 'w-[280px]'} bg-black border-r border-neutral-800 z-50 transition-all duration-300`}>
        <div className="h-16 px-6 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <CortexLogo size={isCollapsed ? 20 : 36} />
            <span className={`font-semibold text-white transition-all duration-300 ${isCollapsed ? 'text-sm' : 'text-xl'}`}>theCortex</span>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 ml-2 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <Menu className="w-2 h-2 text-white" /> : <Menu className="w-4 h-4 text-white" />}
          </button>
        </div>
        {user ? (
          <div className="flex justify-center py-6">
            <div className="relative group flex flex-col items-center">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className={`rounded-full border-2 border-neutral-800 shadow-lg transition-all duration-300 ${isCollapsed ? 'w-10 h-10' : 'w-24 h-24'}`}
                />
              ) : (
                <div className={`rounded-full border-2 border-neutral-800 shadow-lg bg-neutral-800 flex items-center justify-center transition-all duration-300 ${isCollapsed ? 'w-10 h-10' : 'w-24 h-24'}`}>
                  <User className={`${isCollapsed ? 'w-5 h-5' : 'w-12 h-12'} text-neutral-400`} />
                </div>
              )}
              {!isCollapsed && user?.user_metadata?.full_name && (
                <div className="mt-2 text-center text-sm text-white font-medium truncate max-w-[120px]">
                  {user.user_metadata.full_name}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-6">
            <SignInButton />
          </div>
        )}
        <nav className={`flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar transition-all duration-300 ${isCollapsed ? 'px-1' : 'px-4'}`}> 
          {React.Children.map(children, child => {
            if (React.isValidElement(child) && typeof child.type !== 'string') {
              return React.cloneElement(child, { isCollapsed });
            }
            return child;
          })}
        </nav>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4);
        }
        @keyframes glow {
          0% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.5); }
          50% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.8); }
          100% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.5); }
        }
        .glow-effect {
          animation: glow 2s infinite;
        }
      `}</style>
    </>
  );
};

export default Sidebar; 