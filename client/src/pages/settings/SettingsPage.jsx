import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import GlowingEffect from '../../components/ui/GlowingEffect';
import { 
  User, Settings, LogOut, Upload, 
  Mail, Lock, Bell, Globe, Moon, Sun,
  Github, Twitter, Linkedin, Check
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import SectionHeader from '../../components/ui/SectionHeader';
import { Settings as SettingsIcon } from 'lucide-react';

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
  const { user, profile, updateProfile } = useUser();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [uploading, setUploading] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState({});

  useEffect(() => {
    if (user) {
      // Get connected accounts
      const connected = {};
      if (user.identities) {
        user.identities.forEach(identity => {
          connected[identity.provider] = true;
        });
      }
      setConnectedAccounts(connected);
      setLoading(false);
    }
  }, [user]);

  const handleAvatarUpload = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      await updateProfile({ avatar_url: publicUrl });
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setUploading(false);
    }
  };

  const handlePreferenceChange = async (key, value) => {
    try {
      const newPreferences = { ...profile.preferences, [key]: value };
      await updateProfile({ preferences: newPreferences });
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleOAuthLogin = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/settings`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with OAuth:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
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
          icon={SettingsIcon}
          divider
        />
        <div className="max-w-4xl mx-auto space-y-6">
          <GlowingEffect className="bg-surface p-6 rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-semibold">Settings</h1>
                <p className="text-neutral mt-2">Manage your account settings and preferences</p>
              </div>
              <button
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>

            <div className="flex space-x-4 border-b border-surface-light">
              {[
                { id: 'profile', name: 'Profile', icon: User },
                { id: 'account', name: 'Account', icon: Settings },
                { id: 'notifications', name: 'Notifications', icon: Bell },
                { id: 'appearance', name: 'Appearance', icon: Moon }
              ].map(({ id, name, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-4 py-2 -mb-px transition-all duration-200 ${
                    activeTab === id
                      ? 'text-primary border-b-2 border-primary scale-105'
                      : 'text-neutral hover:text-white hover:scale-105'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {name}
                </button>
              ))}
            </div>
          </GlowingEffect>

          {activeTab === 'profile' && (
            <GlowingEffect className="bg-surface p-6 rounded-xl">
              <div className="space-y-6">
                <div className="flex items-center gap-6">
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
                  <div>
                    <h2 className="text-xl font-semibold">
                      {profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || 'User'}
                    </h2>
                    <p className="text-neutral">{profile?.email || user?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || ''}
                      className="w-full bg-background px-4 py-2 rounded-lg border border-surface-light focus:outline-none focus:border-primary"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={profile?.email || user?.email || ''}
                      className="w-full bg-background px-4 py-2 rounded-lg border border-surface-light focus:outline-none focus:border-primary"
                      disabled
                    />
                  </div>
                </div>
              </div>
            </GlowingEffect>
          )}

          {activeTab === 'account' && (
            <GlowingEffect className="bg-surface p-6 rounded-xl">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Connected Accounts</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'google', name: 'Google', icon: GoogleIcon },
                    { id: 'github', name: 'GitHub', icon: Github },
                    { id: 'twitter', name: 'Twitter', icon: Twitter },
                    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin }
                  ].map(({ id, name, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => handleOAuthLogin(id)}
                      className={`flex items-center justify-between p-4 rounded-lg border border-surface-light hover:bg-background-light transition-colors ${
                        connectedAccounts[id] ? 'bg-background-light' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon />
                        <span>Connect with {name}</span>
                      </div>
                      {connectedAccounts[id] && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
            
              </div>
            </GlowingEffect>
          )}

          {activeTab === 'notifications' && (
            <GlowingEffect className="bg-surface p-6 rounded-xl">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Notification Preferences</h2>
                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={profile?.preferences?.notifications}
                      onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                      className="rounded border-surface-light"
                    />
                    <span>Enable Notifications</span>
                  </label>
                </div>
              </div>
            </GlowingEffect>
          )}

          {activeTab === 'appearance' && (
            <GlowingEffect className="bg-surface p-6 rounded-xl">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Appearance Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Theme</label>
                    <select
                      value={profile?.preferences?.theme}
                      onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                      className="w-full bg-background px-4 py-2 rounded-lg border border-surface-light focus:outline-none focus:border-primary"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Language</label>
                    <select
                      value={profile?.preferences?.language}
                      onChange={(e) => handlePreferenceChange('language', e.target.value)}
                      className="w-full bg-background px-4 py-2 rounded-lg border border-surface-light focus:outline-none focus:border-primary"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Timezone</label>
                    <select
                      value={profile?.preferences?.timezone}
                      onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                      className="w-full bg-background px-4 py-2 rounded-lg border border-surface-light focus:outline-none focus:border-primary"
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">EST</option>
                      <option value="PST">PST</option>
                    </select>
                  </div>
                </div>
              </div>
            </GlowingEffect>
          )}
        </div>
      </div>
    </div>
  );
} 