'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  CreditCard,
  Save,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { useAuthStore } from '@/lib/stores/auth-store';

type SettingsTab = 'profile' | 'notifications' | 'security' | 'appearance' | 'billing';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    company: '',
    jobTitle: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    courseUpdates: true,
    promotionalEmails: false,
    weeklyDigest: true,
    certificateAlerts: true,
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
  });

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'appearance' as const, label: 'Appearance', icon: Palette },
    { id: 'billing' as const, label: 'Billing', icon: CreditCard },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Profile Information</h2>
                <p className="text-sm text-gray-500">Update your personal information</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-semibold">
                    {`${profileData.firstName?.[0] || ''}${profileData.lastName?.[0] || ''}`.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <Button variant="outline" size="sm">Change Avatar</Button>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max 2MB</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <Input
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <Input
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="+44 123 456 7890"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <Input
                      value={profileData.company}
                      onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                      placeholder="Your company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title
                    </label>
                    <Input
                      value={profileData.jobTitle}
                      onChange={(e) => setProfileData({ ...profileData, jobTitle: e.target.value })}
                      placeholder="Your job title"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Notification Preferences</h2>
                <p className="text-sm text-gray-500">Choose how you want to be notified</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                  { key: 'courseUpdates', label: 'Course Updates', desc: 'Get notified about course content updates' },
                  { key: 'promotionalEmails', label: 'Promotional Emails', desc: 'Receive offers and promotions' },
                  { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of your learning progress' },
                  { key: 'certificateAlerts', label: 'Certificate Alerts', desc: 'Notifications about certificate expiry' },
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{setting.label}</p>
                      <p className="text-sm text-gray-500">{setting.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            [setting.key]: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Security Settings</h2>
                <p className="text-sm text-gray-500">Manage your account security</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Change Password */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Change Password</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <Input type="password" placeholder="Enter current password" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <Input type="password" placeholder="Enter new password" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <Input type="password" placeholder="Confirm new password" />
                    </div>
                    <Button variant="outline">Update Password</Button>
                  </div>
                </div>

                {/* Two-Factor Auth */}
                <div className="pt-6 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>
                </div>

                {/* Active Sessions */}
                <div className="pt-6 border-t">
                  <h3 className="font-medium text-gray-900 mb-4">Active Sessions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">Current Session</p>
                          <p className="text-xs text-gray-500">Chrome on Windows - Active now</p>
                        </div>
                      </div>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Current</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Appearance</h2>
                <p className="text-sm text-gray-500">Customize how the app looks</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                  <div className="flex gap-3">
                    {['light', 'dark', 'system'].map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setAppearanceSettings({ ...appearanceSettings, theme })}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${
                          appearanceSettings.theme === theme
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select
                    value={appearanceSettings.language}
                    onChange={(e) => setAppearanceSettings({ ...appearanceSettings, language: e.target.value })}
                    className="w-full md:w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="es">Spanish</option>
                    <option value="de">German</option>
                  </select>
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                  <select
                    value={appearanceSettings.timezone}
                    onChange={(e) => setAppearanceSettings({ ...appearanceSettings, timezone: e.target.value })}
                    className="w-full md:w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                    <option value="America/New_York">America/New York (EST)</option>
                    <option value="America/Los_Angeles">America/Los Angeles (PST)</option>
                    <option value="Africa/Harare">Africa/Harare (CAT)</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Billing Settings */}
          {activeTab === 'billing' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Billing & Subscription</h2>
                <p className="text-sm text-gray-500">Manage your subscription and payment methods</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Plan */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Free Plan</p>
                      <p className="text-sm text-gray-500">Basic access to courses</p>
                    </div>
                    <Button>Upgrade Plan</Button>
                  </div>
                </div>

                {/* Payment Methods */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Payment Methods</h3>
                  <div className="text-sm text-gray-500 p-4 border border-dashed rounded-lg text-center">
                    No payment methods added yet
                  </div>
                  <Button variant="outline" className="mt-3">Add Payment Method</Button>
                </div>

                {/* Billing History */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Billing History</h3>
                  <div className="text-sm text-gray-500 p-4 border border-dashed rounded-lg text-center">
                    No billing history available
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          <div className="flex justify-end mt-6">
            <Button onClick={handleSave} isLoading={isSaving}>
              {saved ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
