import React, { useState, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User } from "lucide-react";
import { cn } from "../../utils/cn";
import { Link, useLocation } from 'react-router-dom';
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

export const SidebarLink = ({ to, icon: Icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
        isActive
          ? "bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-lg"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      )}
    >
      <div className={cn(
        "absolute inset-0 bg-gradient-to-r from-violet-600/30 via-purple-600/30 to-fuchsia-600/30 opacity-0 transition-opacity duration-300",
        isActive ? "opacity-100" : "group-hover:opacity-100"
      )} />
      <Icon className={cn(
        "w-5 h-5 relative z-10 transition-transform duration-300",
        isActive ? "scale-110" : "group-hover:scale-110"
      )} />
      <span className="relative z-10 font-medium">{children}</span>
    </Link>
  );
};

export const SidebarBody = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { user, profile } = useUser();

  const profileImage = user?.user_metadata?.avatar_url || profile?.avatar_url;

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <div className="h-16 px-4 flex items-center justify-between bg-gradient-to-r from-violet-600/95 via-purple-600/95 to-fuchsia-600/95 backdrop-blur-sm border-b border-white/20">
          <span className="text-xl font-semibold text-white">theCortex</span>
          <Menu className="w-6 h-6 text-white cursor-pointer hover:text-white/80 transition-colors duration-200" onClick={() => setIsCollapsed(!isCollapsed)} />
        </div>
        <AnimatePresence>
          {isCollapsed && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed inset-0 bg-gradient-to-br from-violet-900/98 via-purple-900/98 to-fuchsia-900/98 backdrop-blur-sm z-50 p-4"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="text-xl font-semibold text-white">theCortex</span>
                <X className="w-6 h-6 text-white cursor-pointer hover:text-white/80 transition-colors duration-200" onClick={() => setIsCollapsed(false)} />
              </div>
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
              <nav className="space-y-2">
                {routes.map((route) => (
                  <Link
                    key={route.path}
                    to={route.path}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                      location.pathname === route.path
                        ? "bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-lg"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                    onClick={() => setIsCollapsed(false)}
                  >
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-r from-violet-600/30 via-purple-600/30 to-fuchsia-600/30 opacity-0 transition-opacity duration-300",
                      location.pathname === route.path ? "opacity-100" : "group-hover:opacity-100"
                    )} />
                    <route.icon className={cn(
                      "w-5 h-5 relative z-10 transition-transform duration-300",
                      location.pathname === route.path ? "scale-110" : "group-hover:scale-110"
                    )} />
                    <span className="relative z-10 font-medium">{route.name}</span>
                  </Link>
                ))}
                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-4" />
                {bottomRoutes.map((route) => (
                  <Link
                    key={route.path}
                    to={route.path}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                      location.pathname === route.path
                        ? "bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-lg"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                    onClick={() => setIsCollapsed(false)}
                  >
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-r from-violet-600/30 via-purple-600/30 to-fuchsia-600/30 opacity-0 transition-opacity duration-300",
                      location.pathname === route.path ? "opacity-100" : "group-hover:opacity-100"
                    )} />
                    <route.icon className={cn(
                      "w-5 h-5 relative z-10 transition-transform duration-300",
                      location.pathname === route.path ? "scale-110" : "group-hover:scale-110"
                    )} />
                    <span className="relative z-10 font-medium">{route.name}</span>
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-[280px] bg-gradient-to-br from-violet-600/95 via-purple-600/95 to-fuchsia-600/95 backdrop-blur-sm border-r border-white/20 z-50">
        <GlowingEffect className="h-16 px-6 flex items-center justify-between border-b border-white/20">
          <span className="text-xl font-semibold text-white">theCortex</span>
        </GlowingEffect>
        <div className="flex justify-center py-6">
          <div className="relative group">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-24 h-24 rounded-full border-2 border-white/20 shadow-lg transition-transform duration-300 group-hover:scale-105"
                
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-2 border-white/20 shadow-lg bg-white/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <User className="w-12 h-12 text-white/70" />
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/20 via-purple-500/20 to-fuchsia-500/20 transition-opacity duration-300 group-hover:opacity-0" />
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {children}
        </nav>
      </div>

      <style jsx>{`
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