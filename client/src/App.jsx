import { Routes, Route } from 'react-router-dom';
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';
import Sidebar, { SidebarBody, SidebarLink } from './components/layout/Sidebar';
import Dashboard from './pages/dashboard/Dashboard';
import GuidanceHub from './pages/guidance/GuidanceHub';
import WorkHub from './pages/work/WorkHub';
import BookLibrary from './pages/books/BookLibrary';
import CreativeHub from './components/creative/CreativeHub';
import Vault from './pages/vault/Vault';
import Login from './pages/auth/Login';
import ProtectedRoute from './routes/ProtectedRoute';
import { routes, bottomRoutes } from './routes/routes';
import CalendarPage from './pages/Calendar';
import Contacts from './pages/contacts/Contacts';
import SettingsPage from './pages/settings/SettingsPage';
import { UserProvider } from './contexts/UserContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from './context/ThemeContext';
import NotificationsPage from './pages/notifications/NotificationsPage';
import HelpPage from './pages/help/HelpPage';
import LogoutPage from './pages/logout/LogoutPage';
import NotFoundPage from './pages/not-found/NotFoundPage';
import { Toaster } from 'react-hot-toast';
import AuthCallback from './pages/auth/AuthCallback';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/layout/Layout';
import Introspection from './pages/Introspection';
import CuriosityCorner from './components/CuriosityCorner/CuriosityCorner';

import BackgroundGrid from './components/ui/BackgroundGrid';

const GOOGLE_CLIENT_ID = '578947614910-3f4lurnl9e2s4l11efp2rn5ihh388lmc.apps.googleusercontent.com';

function App() {
  return (
    <ThemeProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <UserProvider>
          <ToastProvider>
            <Toaster position="top-right" />
            <BackgroundGrid>
              <div className="relative min-h-screen">
                {/* Main content */}
                <div className="flex min-h-screen">
                  <SidebarBody>
                    {routes.map((route) => (
                      <SidebarLink
                        key={route.path}
                        to={route.path}
                        icon={route.icon}
                      >
                        {route.name}
                      </SidebarLink>
                    ))}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4" />
                    {bottomRoutes.map((route) => (
                      <SidebarLink
                        key={route.path}
                        to={route.path}
                        icon={route.icon}
                      >
                        {route.name}
                      </SidebarLink>
                    ))}
                  </SidebarBody>
                  <div className="flex-1 md:ml-[280px]">
                    <main className="p-4 sm:p-6 md:p-8 lg:p-12">
                      <div className="max-w-[1600px] mx-auto">
                        <Routes>
                          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                            <Route index element={<Dashboard />} />
                            <Route path="guidance/*" element={<GuidanceHub />} />
                            <Route path="work/*" element={<WorkHub />} />
                            <Route path="creative/*" element={<CreativeHub />} />
                          </Route>
                          <Route path="/books" element={<ProtectedRoute><BookLibrary /></ProtectedRoute>} />
                          <Route path="/vault" element={<ProtectedRoute><Vault /></ProtectedRoute>} />
                          <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
                          <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
                          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                          <Route path="/help" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />
                          <Route path="/logout" element={<ProtectedRoute><LogoutPage /></ProtectedRoute>} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/auth/callback" element={<AuthCallback />} />
                          <Route path="/introspection" element={<ProtectedRoute><Introspection /></ProtectedRoute>} />
                          <Route path="/curiosity" element={<ProtectedRoute><CuriosityCorner /></ProtectedRoute>} />
                          <Route path="*" element={<ProtectedRoute><NotFoundPage /></ProtectedRoute>} />
                        </Routes>
                      </div>
                    </main>
                  </div>
                </div>
              </div>
            </BackgroundGrid>
          </ToastProvider>
        </UserProvider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
}

export default App; 