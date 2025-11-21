import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { settingsService } from '@/services/settingsService';
import { useAuth } from './AuthContext';

const SettingsContext = createContext(null);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [profile, setProfile] = useState({ name: 'User', id: 'N/A', photo: null });
  const [loading, setLoading] = useState(false);
  const hasLoadedOnceRef = useRef(false);
  const isFetchingRef = useRef(false);

  // Get user name from auth context (Google sign-in or registration)
  const getUserNameFromAuth = useCallback(() => {
    if (!user) return null;
    return (
      user.full_name?.trim() ||
      user.business_name?.trim() ||
      user.name?.trim() ||
      null
    );
  }, [user]);

  // Load from cache instantly
  const loadFromCache = useCallback(() => {
    try {
      const saved = localStorage.getItem('account_settings') || sessionStorage.getItem('account_settings');
      const authName = getUserNameFromAuth();
      
      if (saved) {
        const data = JSON.parse(saved);
        const name =
          authName ||
          data?.editableInfo?.publicName?.trim() ||
          data?.profileData?.publicName?.trim() ||
          'User';
        const id =
          data?.profileData?.supplierCode ||
          data?.profileData?.contactValue ||
          localStorage.getItem('supplier_id') ||
          sessionStorage.getItem('supplier_id') ||
          'N/A';
        const photo = data?.globalUserPhoto || user?.avatar_url || user?.profile_photo || null;
        
        setSettings(data);
        setProfile({ name, id, photo });
        return true;
      } else if (authName) {
        // If no saved settings but we have auth user, use that
        setProfile({ 
          name: authName, 
          id: user?.supplier_code || localStorage.getItem('supplier_id') || 'N/A',
          photo: user?.avatar_url || user?.profile_photo || null
        });
        return true;
      }
    } catch (error) {
      console.warn('Failed to load cached settings', error);
    }
    return false;
  }, [getUserNameFromAuth, user]);

  // Fetch from API (non-blocking, updates cache)
  const fetchSettings = useCallback(async (force = false) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      loadFromCache();
      return;
    }

    // Prevent concurrent fetches
    if (isFetchingRef.current && !force) {
      return;
    }

    isFetchingRef.current = true;
    
    // Only show loading on first load
    if (!hasLoadedOnceRef.current) {
      setLoading(true);
    }

    try {
      const response = await settingsService.getSettings();
      const remoteSettings = response?.settings || {};

      if (Object.keys(remoteSettings).length > 0) {
        const authName = getUserNameFromAuth();
        const name =
          authName ||
          remoteSettings?.editableInfo?.publicName?.trim() ||
          remoteSettings?.profileData?.publicName?.trim() ||
          'User';
        const id =
          remoteSettings?.profileData?.supplierCode ||
          remoteSettings?.profileData?.contactValue ||
          user?.supplier_code ||
          localStorage.getItem('supplier_id') ||
          sessionStorage.getItem('supplier_id') ||
          'N/A';
        const photo = remoteSettings?.globalUserPhoto || user?.avatar_url || user?.profile_photo || null;

        setSettings(remoteSettings);
        setProfile({ name, id, photo });

        // Update cache
        try {
          const serialized = JSON.stringify(remoteSettings);
          localStorage.setItem('account_settings', serialized);
          sessionStorage.setItem('account_settings', serialized);
        } catch (storageError) {
          console.warn('Unable to cache settings', storageError);
        }

        hasLoadedOnceRef.current = true;
      } else {
        // Fallback to cache if API returns empty
        loadFromCache();
      }
    } catch (error) {
      console.error('Failed to fetch settings', error);
      // Fallback to cache on error
      if (!hasLoadedOnceRef.current) {
        loadFromCache();
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [loadFromCache]);

  // Update settings (optimistic update)
  const updateSettings = useCallback((newSettings) => {
    setSettings(newSettings);
    
    const authName = getUserNameFromAuth();
    const name =
      authName ||
      newSettings?.editableInfo?.publicName?.trim() ||
      newSettings?.profileData?.publicName?.trim() ||
      'User';
    const id =
      newSettings?.profileData?.supplierCode ||
      newSettings?.profileData?.contactValue ||
      user?.supplier_code ||
      localStorage.getItem('supplier_id') ||
      sessionStorage.getItem('supplier_id') ||
      'N/A';
    const photo = newSettings?.globalUserPhoto || user?.avatar_url || user?.profile_photo || null;

    setProfile({ name, id, photo });

    // Update cache immediately
    try {
      const serialized = JSON.stringify(newSettings);
      localStorage.setItem('account_settings', serialized);
      sessionStorage.setItem('account_settings', serialized);
    } catch (storageError) {
      console.warn('Unable to cache updated settings', storageError);
    }

    // Dispatch event for other components
    window.dispatchEvent(new Event('account_settings_updated'));
    window.dispatchEvent(new Event('accountSettingsUpdated'));
  }, []);

  // Update profile when user changes - prioritize auth user name
  useEffect(() => {
    const authName = getUserNameFromAuth();
    if (authName) {
      // Always update profile name from auth user if available
      setProfile(prev => ({
        ...prev,
        name: authName,
        photo: prev.photo || user?.avatar_url || user?.profile_photo || null
      }));
    } else if (user) {
      // If no auth name but user exists, try to get name from user object
      const fallbackName = user?.full_name || user?.business_name || user?.name;
      if (fallbackName) {
        setProfile(prev => ({
          ...prev,
          name: fallbackName,
          photo: prev.photo || user?.avatar_url || user?.profile_photo || null
        }));
      }
    }
  }, [user, getUserNameFromAuth]);

  // Initialize: Load from cache instantly, then fetch in background
  useEffect(() => {
    // Load from cache immediately (instant)
    loadFromCache();
    
    // Fetch from API in background (non-blocking)
    fetchSettings();

    // Listen for updates
    const handleUpdate = () => {
      loadFromCache();
      fetchSettings(true);
    };

    window.addEventListener('account_settings_updated', handleUpdate);
    window.addEventListener('accountSettingsUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('account_settings_updated', handleUpdate);
      window.removeEventListener('accountSettingsUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadFromCache, fetchSettings, getUserNameFromAuth, user]);

  const value = {
    settings,
    profile,
    loading,
    updateSettings,
    refreshSettings: () => fetchSettings(true),
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

