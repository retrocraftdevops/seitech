'use client';

import { useState, FormEvent } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { User, Mail, Phone, Building, Briefcase, Lock, Camera, Save } from 'lucide-react';

// Placeholder data
const mockUser = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  companyName: 'Tech Solutions Inc.',
  jobTitle: 'Senior Developer',
  avatar: '',
  level: 'Advanced',
  totalPoints: 3450,
};

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(mockUser);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // TODO: Implement profile update logic
    setTimeout(() => {
      console.log('Profile update:', formData);
      setIsSaving(false);
      setIsEditing(false);
    }, 1500);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      {/* Profile Card */}
      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Avatar Section */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {formData.firstName[0]}
                {formData.lastName[0]}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border-2 border-gray-200 hover:bg-gray-50">
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {formData.firstName} {formData.lastName}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="primary">Level: {formData.level}</Badge>
                <Badge variant="success">{formData.totalPoints.toLocaleString()} Points</Badge>
              </div>
              <p className="text-sm text-gray-600">
                {formData.jobTitle} at {formData.companyName}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  label="First Name"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                  className="pl-10"
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  label="Last Name"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                  className="pl-10"
                  disabled={!isEditing}
                  required
                />
              </div>
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-[42px] h-5 w-5 text-gray-400" />
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                className="pl-10"
                disabled={!isEditing}
                required
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-[42px] h-5 w-5 text-gray-400" />
              <Input
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
                className="pl-10"
                disabled={!isEditing}
              />
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Professional Information
              </h3>

              <div className="space-y-6">
                <div className="relative">
                  <Building className="absolute left-3 top-[42px] h-5 w-5 text-gray-400" />
                  <Input
                    label="Company Name"
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => updateFormData('companyName', e.target.value)}
                    className="pl-10"
                    disabled={!isEditing}
                  />
                </div>

                <div className="relative">
                  <Briefcase className="absolute left-3 top-[42px] h-5 w-5 text-gray-400" />
                  <Input
                    label="Job Title"
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => updateFormData('jobTitle', e.target.value)}
                    className="pl-10"
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSaving}
                  leftIcon={<Save className="w-5 h-5" />}
                >
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(mockUser);
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card variant="bordered">
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Password</h3>
                  <p className="text-sm text-gray-600">Last changed 3 months ago</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Change Password
              </Button>
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-1">
                  Two-Factor Authentication
                </h3>
                <p className="text-sm text-gray-600">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Button variant="outline" size="sm">
                Enable
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Preferences */}
      <Card variant="bordered">
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Email Preferences</h2>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mt-1"
                defaultChecked
              />
              <div>
                <p className="font-medium text-gray-900">Course Updates</p>
                <p className="text-sm text-gray-600">
                  Receive notifications about new lessons and course updates
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mt-1"
                defaultChecked
              />
              <div>
                <p className="font-medium text-gray-900">Achievements</p>
                <p className="text-sm text-gray-600">
                  Get notified when you earn badges and complete milestones
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mt-1"
              />
              <div>
                <p className="font-medium text-gray-900">Marketing Emails</p>
                <p className="text-sm text-gray-600">
                  Receive news about new courses and special offers
                </p>
              </div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card variant="bordered" className="border-red-200">
        <CardHeader>
          <h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Delete Account</h3>
              <p className="text-sm text-gray-600">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button variant="danger" size="sm">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
