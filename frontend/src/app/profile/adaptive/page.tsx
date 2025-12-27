'use client';

import { useState, useEffect } from 'react';
import AdaptiveProfile from '@/components/adaptive/AdaptiveProfile';
import RecommendationEngine from '@/components/adaptive/RecommendationEngine';
import { Brain, Target, TrendingUp, Book, Award } from 'lucide-react';

interface LearningPreference {
  visual: number;
  auditory: number;
  kinesthetic: number;
  reading_writing: number;
}

interface PerformanceMetric {
  metric_name: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  description: string;
}

export default function AdaptiveProfilePage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [preferences, setPreferences] = useState<LearningPreference>({
    visual: 50,
    auditory: 50,
    kinesthetic: 50,
    reading_writing: 50,
  });
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAdaptiveData();
  }, []);

  const fetchAdaptiveData = async () => {
    try {
      // Fetch user profile
      const profileResponse = await fetch('/api/user/profile');
      const profileData = await profileResponse.json();
      setUserId(profileData.id);

      // Fetch learning preferences
      const preferencesResponse = await fetch('/api/adaptive-learning/preferences');
      const preferencesData = await preferencesResponse.json();
      if (preferencesData) {
        setPreferences(preferencesData);
      }

      // Fetch performance metrics
      const metricsResponse = await fetch('/api/adaptive-learning/metrics');
      const metricsData = await metricsResponse.json();
      setPerformanceMetrics(metricsData);
    } catch (error) {
      console.error('Error fetching adaptive data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (type: keyof LearningPreference, value: number) => {
    setPreferences((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/adaptive-learning/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        alert('Preferences saved successfully!');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'down':
        return <TrendingUp className="h-5 w-5 text-red-600 rotate-180" />;
      default:
        return <TrendingUp className="h-5 w-5 text-gray-400 rotate-90" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading adaptive profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Brain className="h-8 w-8 mr-3" />
            Adaptive Learning Profile
          </h1>
          <p className="text-lg opacity-90">
            Personalize your learning experience with AI-powered recommendations
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skills Radar Chart */}
            {userId && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Target className="h-6 w-6 mr-2" />
                  Skill Profile
                </h2>
                <AdaptiveProfile userId={userId} />
              </div>
            )}

            {/* Learning Preferences */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Learning Style Preferences</h2>
              <div className="space-y-6">
                {/* Visual */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-semibold text-gray-900">Visual Learning</label>
                    <span className="text-blue-600 font-bold">{preferences.visual}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={preferences.visual}
                    onChange={(e) => handlePreferenceChange('visual', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Learning through diagrams, charts, and visual content
                  </p>
                </div>

                {/* Auditory */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-semibold text-gray-900">Auditory Learning</label>
                    <span className="text-green-600 font-bold">{preferences.auditory}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={preferences.auditory}
                    onChange={(e) => handlePreferenceChange('auditory', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Learning through lectures, discussions, and audio content
                  </p>
                </div>

                {/* Kinesthetic */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-semibold text-gray-900">Kinesthetic Learning</label>
                    <span className="text-purple-600 font-bold">{preferences.kinesthetic}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={preferences.kinesthetic}
                    onChange={(e) => handlePreferenceChange('kinesthetic', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Learning through hands-on practice and experimentation
                  </p>
                </div>

                {/* Reading/Writing */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-semibold text-gray-900">Reading/Writing</label>
                    <span className="text-orange-600 font-bold">{preferences.reading_writing}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={preferences.reading_writing}
                    onChange={(e) => handlePreferenceChange('reading_writing', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Learning through reading articles and writing notes
                  </p>
                </div>
              </div>

              <button
                onClick={handleSavePreferences}
                disabled={saving}
                className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>

            {/* Recommended Content */}
            {userId && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Book className="h-6 w-6 mr-2" />
                  Recommended for You
                </h2>
                <RecommendationEngine userId={userId} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Performance Metrics */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Performance Metrics
              </h3>
              <div className="space-y-4">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 text-sm">{metric.metric_name}</span>
                      {getTrendIcon(metric.trend)}
                    </div>
                    <p className="text-2xl font-bold text-blue-600 mb-1">{metric.value}%</p>
                    <p className="text-xs text-gray-600">{metric.description}</p>
                  </div>
                ))}

                {performanceMetrics.length === 0 && (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600">
                      Complete more courses to see your performance metrics
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Learning Goals */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
              <h3 className="font-bold mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Your Learning Goals
              </h3>
              <div className="space-y-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <p className="font-semibold text-sm">Complete 5 courses this month</p>
                  <div className="mt-2 w-full bg-white/30 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  <p className="text-xs mt-1 opacity-90">3 of 5 completed</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <p className="font-semibold text-sm">Earn Python Expert badge</p>
                  <div className="mt-2 w-full bg-white/30 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                  <p className="text-xs mt-1 opacity-90">80% progress</p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                <Brain className="h-5 w-5 mr-2 text-yellow-600" />
                Learning Tip
              </h3>
              <p className="text-sm text-gray-700">
                Based on your visual learning preference, try using mind maps and flowcharts to 
                organize complex concepts. This can significantly improve retention!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
