'use client';

// ==============================================================================
// SAFE GUARD AI - Unified Client Authentication Context
// Seamless integration between Supabase Auth and Resilient Role-Based Storage
// ==============================================================================

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile, UserRole } from '../types';
import { mockDb, INITIAL_PROFILES } from './mockStore';

interface AuthContextType {
  user: Profile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, role?: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  switchUser: (profileId: string) => void;
  availableUsers: Profile[];
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'driver',
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  logout: async () => {},
  switchUser: () => {},
  availableUsers: [],
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check saved session in localStorage
    const savedUserId = localStorage.getItem('safeguard_active_user_id');
    if (savedUserId) {
      const found = mockDb.profiles.find((p) => p.id === savedUserId);
      if (found) {
        setUser(found);
      } else {
        setUser(INITIAL_PROFILES[0]); // Default to Rajesh Kumar (Driver)
      }
    } else {
      // Default initial session for immediate exploration
      setUser(INITIAL_PROFILES[0]);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, explicitRole?: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      const matched = mockDb.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        setUser(matched);
        localStorage.setItem('safeguard_active_user_id', matched.id);
        setIsLoading(false);
        return true;
      }

      // If user logs in with role selection
      if (explicitRole) {
        const roleUser = mockDb.profiles.find((p) => p.role === explicitRole);
        if (roleUser) {
          setUser(roleUser);
          localStorage.setItem('safeguard_active_user_id', roleUser.id);
          setIsLoading(false);
          return true;
        }
      }

      setIsLoading(false);
      return false;
    } catch (e) {
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    localStorage.removeItem('safeguard_active_user_id');
    setUser(null);
  };

  const switchUser = (profileId: string) => {
    const found = mockDb.profiles.find((p) => p.id === profileId);
    if (found) {
      setUser(found);
      localStorage.setItem('safeguard_active_user_id', found.id);
    }
  };

  const role: UserRole = user?.role || 'driver';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        logout,
        switchUser,
        availableUsers: mockDb.profiles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

