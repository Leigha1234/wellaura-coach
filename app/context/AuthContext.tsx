import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

// --- TYPE DEFINITIONS ---
interface User {
  id: string;
  name: string;
  role: 'coach' | 'client';
  email?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email, password) => Promise<void>;
  signUpCoach: (email, password, name) => Promise<void>;
  createClientAccount: (email, password, name) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

// --- CONTEXT CREATION ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Checks for a saved user session on app start
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          if (profile) {
            setUser({ ...session.user, ...profile });
          }
        }
      } catch (e) {
        console.error("Failed to load user session.", e);
      } finally {
        setIsLoading(false);
      }
    };
    checkUserSession();
  }, []);

  // --- UPDATED LOGIN FUNCTION ---
  const login = async (email, password) => {
    // Step 1: Authenticate with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        alert(error.message);
        return;
    }

    // Step 2: If authentication is successful, fetch the user's profile
    if (data.user) {
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('name, role') // We only need the name and role
            .eq('id', data.user.id)
            .single();
        
        if (profileError) {
            alert(`Error fetching profile: ${profileError.message}`);
        } else if (profile) {
            // Step 3: Combine auth info with profile info and set the global user state
            setUser({ 
                id: data.user.id,
                email: data.user.email,
                name: profile.name,
                role: profile.role,
            });
        }
    }
  };

  const signUpCoach = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: { data: { name: name, role: 'coach' } }
    });
    if (error) {
      alert(error.message);
    } else if (data.user) {
      setUser({ id: data.user.id, email: data.user.email, name, role: 'coach' });
    }
  };
  
  const createClientAccount = async (email, password, name): Promise<boolean> => { /* ... (This function is correct) ... */ return false; };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signUpCoach, createClientAccount, logout, isLoading }}>
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