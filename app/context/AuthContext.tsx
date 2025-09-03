import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// --- TYPE DEFINITIONS ---
interface User {
  id: string;
  name: string;
  role: 'coach' | 'client';
}

interface AuthContextType {
  user: User | null;
  login: (userId: string) => void;
  logout: () => void;
  isLoading: boolean; // Tracks initial session check
}

// --- MOCK USER DATABASE ---
const MOCK_USERS: { [id: string]: User } = {
  'coach-123': { id: 'coach-123', name: 'Leigha (Coach)', role: 'coach' },
  '1': { id: '1', name: 'Jane Doe', role: 'client' },
  '2': { id: '2', name: 'John Smith', role: 'client' },
  '3': { id: '3', name: 'Alice Johnson', role: 'client' },
  '4': { id: '4', name: 'Michael Brown', role: 'client' },
};

// --- CONTEXT CREATION ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);


// --- PROVIDER COMPONENT ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // This effect runs once on app start to check for a saved user session
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const savedUserId = await AsyncStorage.getItem('@auth_user_id');
        if (savedUserId) {
          const foundUser = MOCK_USERS[savedUserId];
          if (foundUser) {
            setUser(foundUser);
          }
        }
      } catch (e) {
        console.error("Failed to load user session.", e);
      } finally {
        // We're done checking, so set loading to false
        setIsLoading(false);
      }
    };

    checkUserSession();
  }, []);

  const login = async (userId: string) => {
    const foundUser = MOCK_USERS[userId];
    if (foundUser) {
      setUser(foundUser);
      await AsyncStorage.setItem('@auth_user_id', userId);
    } else {
      console.error("User not found!");
    }
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('@auth_user_id');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};


// --- CUSTOM HOOK ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};