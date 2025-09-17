// This polyfill MUST be imported before the Supabase client
import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ikynzjcdgzumirxssubc.supabase.co'; // Paste your URL here
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlreW56amNkZ3p1bWlyeHNzdWJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MDQ0MDYsImV4cCI6MjA3MjQ4MDQwNn0.rZoTbl7Ud-21UFJRoybLTp0lKaq1fq6tW8apovKkKt8'; // Paste your Key here

// This configuration is specific to React Native and is essential for
// a stable connection and session management.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});