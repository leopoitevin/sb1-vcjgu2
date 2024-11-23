import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { updateMasterCampaign } from '../services/popcash';
import { validateSitemapUrl } from '../services/sitemap';
import { TrafficRouter } from '../services/trafficRouter';
import { Globe, FileText, Link as LinkIcon, AlertCircle, Loader2 } from 'lucide-react';

const REDIRECT_URL = 'https://redirect.seodopamine.com/traffic';

export default function NewCampaign() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const [campaignType, setCampaignType] = useState<'site' | 'page' | 'backlinks' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    sitemapUrl: '',
    visitsPerDay: 100,
    duration: 7,
  });

  const validateSitemap = async (url: string) => {
    if (!url) return;
    
    setIsValidating(true);
    setError(null);
    
    try {
      const result = await validateSitemapUrl(url);
      if (!result.isValid) {
        setError(result.message || 'Invalid sitemap URL');
        setFormData(prev => ({ ...prev, sitemapUrl: '' }));
      } else {
        setFormData(prev => ({ ...prev, sitemapUrl: url }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate sitemap URL');
      setFormData(prev => ({ ...prev, sitemapUrl: '' }));
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignType) return;

    setError(null);
    setIsSubmitting(true);
    
    try {
      // Update master campaign budget
      await updateMasterCampaign({
        name: 'SEO Dopamine Traffic Router',
        url: REDIRECT_URL,
        visitsPerDay: formData.visitsPerDay,
      });

      // Add campaign to local router
      const router = TrafficRouter.getInstance();
      const newCampaign = {
        id: Date.now(),
        status: 1,
        url: formData.url,
        name: formData.name,
        bid: 0.001,
        trafficType: campaignType,
        visitsPerDay: formData.visitsPerDay,
        duration: formData.duration,
        startDate: new Date().toISOString(),
        sitemapUrl: formData.sitemapUrl,
      };

      router.addCampaign(newCampaign);

      if (user) {
        setUser({
          ...user,
          campaigns: [...user.campaigns, newCampaign],
        });
      }

      navigate('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create campaign. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Create New Campaign</h1>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {step === 1 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <button
            onClick={() => {
              setCampaignType('site');
              setStep(2);
              setError(null);
            }}
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex flex-col items-center hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Globe className="h-8 w-8 text-indigo-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Whole Site</span>
          </button>

          <button
            onClick={() => {
              setCampaignType('page');
              setStep(2);
              setError(null);
            }}
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex flex-col items-center hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <FileText className="h-8 w-8 text-indigo-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Single Page</span>
          </button>

          <button
            onClick={() => {
              setCampaignType('backlinks');
              setStep(2);
              setError(null);
            }}
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex flex-col items-center hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <LinkIcon className="h-8 w-8 text-indigo-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Backlinks</span>
          </button>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Campaign Name
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {campaignType === 'site' && (
            <>
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                  Website URL
                </label>
                <input
                  type="url"
                  id="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label htmlFor="sitemapUrl" className="block text-sm font-medium text-gray-700">
                  Sitemap URL
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="url"
                    id="sitemapUrl"
                    required
                    value={formData.sitemapUrl}
                    onChange={(e) => validateSitemap(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="https://example.com/sitemap.xml"
                  />
                  {isValidating && (
                    <div className="ml-3 flex items-center">
                      <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                    </div>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Provide your sitemap URL (supports sitemap index XML)
                </p>
              </div>
            </>
          )}

          {(campaignType === 'page' || campaignType === 'backlinks') && (
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                Target URL
              </label>
              <input
                type="url"
                id="url"
                required
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="https://example.com/page"
              />
            </div>
          )}

          <div>
            <label htmlFor="visitsPerDay" className="block text-sm font-medium text-gray-700">
              Visits per Day
            </label>
            <input
              type="number"
              id="visitsPerDay"
              required
              min="1"
              value={formData.visitsPerDay}
              onChange={(e) => setFormData(prev => ({ ...prev, visitsPerDay: parseInt(e.target.value) }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
              Campaign Duration (days)
            </label>
            <input
              type="number"
              id="duration"
              required
              min="1"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError(null);
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isValidating}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Campaign'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}