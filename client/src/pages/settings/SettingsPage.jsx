import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import GlowingEffect from '../../components/ui/GlowingEffect';
import { 
  User, Settings, LogOut, Upload, 
  Mail, Lock, Bell, Globe, Moon, Sun,
  Github, Twitter, Linkedin, Check, Trash2, Eye, EyeOff
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import SectionHeader from '../../components/ui/SectionHeader';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const sidebarTabs = [
  { id: 'profile', name: 'Profile', icon: User },
  { id: 'account', name: 'Account', icon: Settings },
  { id: 'notifications', name: 'Notifications', icon: Bell },
  { id: 'appearance', name: 'Appearance', icon: Moon },
  { id: 'security', name: 'Security', icon: Lock },
];

const GoogleIcon = () => (
  <svg
    className="w-5 h-5"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export default function SettingsPage() {
  const { user, profile, updateProfile, signOut } = useUser();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [uploading, setUploading] = useState(false);
  const [editProfile, setEditProfile] = useState({ full_name: '', email: '' });
  const [editMode, setEditMode] = useState(false);
  const [editPassword, setEditPassword] = useState({ current: '', new: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState({ email: true, inApp: true, product: false });
  const [appearance, setAppearance] = useState({ theme: 'system', fontSize: 'normal' });
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [connectedAccounts, setConnectedAccounts] = useState({});
  const [deleting, setDeleting] = useState(false);
  const [securityInfo, setSecurityInfo] = useState({ lastLogin: '', sessions: [] });
  const [isSigningOut, setIsSigningOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setEditProfile({
        full_name: user.user_metadata?.full_name || '',
        email: user.email || '',
      });
      // Connected accounts
      const connected = {};
      if (user.identities) {
        user.identities.forEach(identity => {
          connected[identity.provider] = true;
        });
      }
      setConnectedAccounts(connected);
      // Security info
      setSecurityInfo({
        lastLogin: user.last_sign_in_at || '',
        sessions: [{ device: 'This device', time: user.last_sign_in_at || '' }],
      });
      
      // If we have a profile, use its preferences
      if (profile) {
        setNotificationPrefs(profile.preferences?.notifications || { email: true, inApp: true, product: false });
        setAppearance(profile.preferences?.appearance || { theme: 'system', fontSize: 'normal' });
      }
      
      setLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const { searchParams } = new URL(window.location.href);
      const code = searchParams.get('code');
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error('Error exchanging code for session:', error);
        } else {
          console.log('Successfully logged in:', data);
        }
      }
    };
    handleOAuthCallback();
  }, []);

  const handleAvatarUpload = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      await updateProfile({ avatar_url: publicUrl });
      setFeedback('Avatar updated!');
    } catch (error) {
      setError('Error uploading avatar.');
    } finally {
      setUploading(false);
    }
  };

  const handleProfileSave = async () => {
    try {
      await updateProfile({ full_name: editProfile.full_name, email: editProfile.email });
      setEditMode(false);
      setFeedback('Profile updated!');
    } catch (error) {
      setError('Error updating profile.');
    }
  };

  const handlePasswordChange = async () => {
    // Implement password change logic here (using supabase or your backend)
    setFeedback('Password changed!');
    setEditPassword({ current: '', new: '', confirm: '' });
  };

  const handleNotificationChange = (key) => {
    setNotificationPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAppearanceChange = (key, value) => {
    setAppearance((prev) => ({ ...prev, [key]: value }));
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    // Implement account deletion logic here
    setTimeout(() => {
      setDeleting(false);
      setFeedback('Account deleted.');
    }, 2000);
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      setError(null);
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out. Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  };

  // Add error handling for when user is not available
  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-950 p-8">
        <div className="max-w-4xl mx-auto">
          <GlowingEffect className="bg-surface p-6 rounded-xl">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-500 mb-2">Authentication Required</h2>
              <p className="text-neutral-400 mb-6">Please sign in to access settings.</p>
              <Button 
                variant="primary" 
                onClick={() => window.location.href = '/login'}
                className="flex items-center gap-2 mx-auto"
              >
                <User className="w-4 h-4" />
                Sign In
              </Button>
            </div>
          </GlowingEffect>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 p-8">
        <div className="max-w-4xl mx-auto">
          <GlowingEffect className="bg-surface p-6 rounded-xl">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-background-light rounded w-1/4"></div>
              <div className="h-32 bg-background-light rounded"></div>
            </div>
          </GlowingEffect>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-8">
      <div className="max-w-[1600px] mx-auto">
        <SectionHeader
          title="Settings"
          subtitle="Configure your preferences and account."
          center
          icon={Settings}
          divider
        />
        <div className="max-w-5xl mx-auto flex gap-8 mt-8">
          {/* Sidebar Navigation */}
          <div className="w-56 flex-shrink-0">
            <div className="bg-surface rounded-xl shadow p-4 flex flex-col gap-2">
              {sidebarTabs.map(({ id, name, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-left font-medium text-base ${
                    activeTab === id
                      ? 'bg-primary/10 text-primary' : 'hover:bg-surface-light text-neutral-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {name}
                </button>
              ))}
              <div className="border-t border-surface-light my-2" />
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-all font-medium"
              >
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <GlowingEffect className="bg-surface p-6 rounded-xl">
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-background-light">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-full h-full p-6 text-neutral" />
                      )}
                    </div>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary-light transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </div>
                  <div className="flex-1">
                    {editMode ? (
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={editProfile.full_name ?? ''}
                          onChange={e => setEditProfile(p => ({ ...p, full_name: e.target.value }))}
                          className="w-full bg-background px-4 py-2 rounded-lg border border-surface-light focus:outline-none focus:border-primary"
                          placeholder="Full Name"
                        />
                        <input
                          type="email"
                          value={editProfile.email ?? ''}
                          onChange={e => setEditProfile(p => ({ ...p, email: e.target.value }))}
                          className="w-full bg-background px-4 py-2 rounded-lg border border-surface-light focus:outline-none focus:border-primary"
                          placeholder="Email"
                        />
                        <div className="flex gap-2 mt-2">
                          <Button onClick={handleProfileSave} variant="primary">Save</Button>
                          <Button onClick={() => setEditMode(false)} variant="secondary">Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-xl font-semibold">
                          {profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || 'User'}
                        </h2>
                        <p className="text-neutral">{profile?.email || user?.email}</p>
                        <Button onClick={() => setEditMode(true)} variant="secondary" className="mt-2">Edit Profile</Button>
                      </>
                    )}
                  </div>
                </div>
                {feedback && <div className="text-green-500 text-sm mb-2">{feedback}</div>}
                {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
              </GlowingEffect>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <GlowingEffect className="bg-surface p-6 rounded-xl">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Change Password</h2>
                  <div className="flex flex-col gap-2 max-w-md">
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={editPassword.current ?? ''}
                        onChange={e => setEditPassword(p => ({ ...p, current: e.target.value }))}
                        className="w-full bg-background px-4 py-2 rounded-lg border border-surface-light focus:outline-none focus:border-primary"
                        placeholder="Current Password"
                      />
                      <button type="button" className="absolute right-2 top-2" onClick={() => setShowPassword(s => !s)}>
                        {showPassword ? <EyeOff className="w-4 h-4 text-neutral-400" /> : <Eye className="w-4 h-4 text-neutral-400" />}
                      </button>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={editPassword.new ?? ''}
                      onChange={e => setEditPassword(p => ({ ...p, new: e.target.value }))}
                      className="w-full bg-background px-4 py-2 rounded-lg border border-surface-light focus:outline-none focus:border-primary"
                      placeholder="New Password"
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={editPassword.confirm ?? ''}
                      onChange={e => setEditPassword(p => ({ ...p, confirm: e.target.value }))}
                      className="w-full bg-background px-4 py-2 rounded-lg border border-surface-light focus:outline-none focus:border-primary"
                      placeholder="Confirm New Password"
                    />
                    <div className="flex gap-2 mt-2">
                      <Button onClick={handlePasswordChange} variant="primary">Change Password</Button>
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Connected Accounts</h2>
                  <div className="flex gap-4">
                    <Button variant={connectedAccounts.google ? 'secondary' : 'primary'}>
                      <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> Google {connectedAccounts.google ? '(Connected)' : 'Connect'}</span>
                    </Button>
                    <Button variant={connectedAccounts.github ? 'secondary' : 'primary'}>
                      <span className="flex items-center gap-2"><Github className="w-4 h-4" /> GitHub {connectedAccounts.github ? '(Connected)' : 'Connect'}</span>
                    </Button>
                  </div>
                </div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2 text-red-500">Delete Account</h2>
                  <Button onClick={handleDeleteAccount} variant="destructive" disabled={deleting}>
                    <Trash2 className="w-4 h-4 mr-1" /> {deleting ? 'Deleting...' : 'Delete Account'}
                  </Button>
                </div>
                {feedback && <div className="text-green-500 text-sm mb-2">{feedback}</div>}
                {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
              </GlowingEffect>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <GlowingEffect className="bg-surface p-6 rounded-xl">
                <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
                <div className="flex flex-col gap-4 max-w-md">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={notificationPrefs.email} onChange={() => handleNotificationChange('email')} className="form-checkbox h-5 w-5 text-primary" />
                    Email Notifications
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={notificationPrefs.inApp} onChange={() => handleNotificationChange('inApp')} className="form-checkbox h-5 w-5 text-primary" />
                    In-App Notifications
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={notificationPrefs.product} onChange={() => handleNotificationChange('product')} className="form-checkbox h-5 w-5 text-primary" />
                    Product Updates & News
                  </label>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="primary">Save Preferences</Button>
                </div>
                {feedback && <div className="text-green-500 text-sm mb-2">{feedback}</div>}
                {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
              </GlowingEffect>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <GlowingEffect className="bg-surface p-6 rounded-xl">
                <h2 className="text-xl font-semibold mb-4">Appearance</h2>
                <div className="flex flex-col gap-4 max-w-md">
                  <label className="block font-medium mb-1">Theme</label>
                  <select
                    value={appearance.theme}
                    onChange={e => handleAppearanceChange('theme', e.target.value)}
                    className="w-full bg-background px-4 py-2 rounded-lg border border-surface-light focus:outline-none focus:border-primary"
                  >
                    <option value="system">System</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                  <label className="block font-medium mb-1">Font Size</label>
                  <select
                    value={appearance.fontSize}
                    onChange={e => handleAppearanceChange('fontSize', e.target.value)}
                    className="w-full bg-background px-4 py-2 rounded-lg border border-surface-light focus:outline-none focus:border-primary"
                  >
                    <option value="normal">Normal</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="primary">Save Appearance</Button>
                  <Button variant="secondary" onClick={() => setAppearance({ theme: 'system', fontSize: 'normal' })}>Reset</Button>
                </div>
                {feedback && <div className="text-green-500 text-sm mb-2">{feedback}</div>}
                {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
              </GlowingEffect>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <GlowingEffect className="bg-surface p-6 rounded-xl">
                <h2 className="text-xl font-semibold mb-4">Security</h2>
                <div className="mb-4">
                  <div className="text-neutral-400 text-sm">Last Login:</div>
                  <div className="text-white font-medium">{securityInfo.lastLogin ? new Date(securityInfo.lastLogin).toLocaleString() : 'Unknown'}</div>
                </div>
                <div className="mb-4">
                  <div className="text-neutral-400 text-sm mb-1">Active Sessions</div>
                  <ul className="list-disc pl-6">
                    {securityInfo.sessions.map((s, i) => (
                      <li key={i} className="text-white text-sm">{s.device} - {s.time ? new Date(s.time).toLocaleString() : 'Unknown'}</li>
                    ))}
                  </ul>
                </div>
                <Button variant="secondary">Sign Out of All Devices</Button>
              </GlowingEffect>
            )}

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Supabase Authentication</h2>
              <p className="text-gray-600 mb-4">Sign in to Supabase using your Google account.</p>
              <button
                onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Sign in with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 