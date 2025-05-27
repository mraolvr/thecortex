import { Routes, Route } from 'react-router-dom';
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';
import Sidebar, { SidebarBody, SidebarLink } from './components/layout/Sidebar';
import Dashboard from './pages/dashboard/Dashboard';
import GuidanceHub from './pages/guidance/GuidanceHub';
import WorkHub from './pages/work/WorkHub';
import BookLibrary from './pages/books/BookLibrary';
import CreativeHub from './pages/creative/CreativeHub';
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
import Header from './components/layout/Header';
import NotificationsPage from './pages/notifications/NotificationsPage';
import HelpPage from './pages/help/HelpPage';
import LogoutPage from './pages/logout/LogoutPage';
import NotFoundPage from './pages/not-found/NotFoundPage';
import { Toaster } from 'react-hot-toast';
import AuthCallback from './pages/auth/AuthCallback';

const GOOGLE_CLIENT_ID = '578947614910-3f4lurnl9e2s4l11efp2rn5ihh388lmc.apps.googleusercontent.com';

function App() {
  return (
    <ThemeProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <UserProvider>
          <Toaster position="top-right" />
          <div className="min-h-screen text-white bg-gradient-to-br from-violet-600 via-fuchsia-500 via-40% to-emerald-500 dark:bg-gradient-to-br dark:from-violet-950 dark:via-fuchsia-900 dark:via-40% dark:to-emerald-900">
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
                  <Header />
                  <main className="p-6 md:p-8 lg:p-12">
                    <div className="max-w-[1600px] mx-auto">
                      <Routes>
                        <Route path="/" element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        } />
                        <Route path="/guidance" element={
                          <ProtectedRoute>
                            <GuidanceHub />
                          </ProtectedRoute>
                        } />
                        <Route path="/work" element={
                          <ProtectedRoute>
                            <WorkHub />
                          </ProtectedRoute>
                        } />
                        <Route path="/books" element={<ProtectedRoute><BookLibrary /></ProtectedRoute>} />
                        <Route path="/creative" element={<ProtectedRoute><CreativeHub /></ProtectedRoute>} />
                        <Route path="/vault" element={<ProtectedRoute><Vault /></ProtectedRoute>} />
                        <Route path="/calendar" element={
                          <ProtectedRoute>
                            <CalendarPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
                        <Route path="/settings" element={
                          <ProtectedRoute>
                            <SettingsPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                        <Route path="/help" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />
                        <Route path="/logout" element={<ProtectedRoute><LogoutPage /></ProtectedRoute>} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/auth/callback" element={<AuthCallback />} />
                        <Route path="*" element={<ProtectedRoute><NotFoundPage /></ProtectedRoute>} />
                      </Routes>
                    </div>
                  </main>
                </div>
              </div>
            </div>
          </div>
        </UserProvider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
}

export default App; 