import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; // Adjust path if needed
import { useAuth } from './context/AuthContext';
import { BudgetSettings, CalendarEvent, Habit, Transaction } from './types';

// --- ASYNCSTORAGE KEYS (for features not yet migrated to Supabase) ---
const BUDGET_TRANSACTIONS_KEY = 'budget_transactions_v12';
const BUDGET_SETTINGS_KEY = 'budget_settings_v12';

// --- DEFAULTS ---
const defaultBudgetSettings: BudgetSettings = { incomeVaries: true, fixedIncome: '2000', customCategories: [], customIncomeCategories: [], budgetPeriod: 'Monthly', defaultCategoryAmounts: {}, scheduledPayments: [] };

// --- CONTEXT TYPE DEFINITION ---
interface WellauraContextType {
  isLoading: boolean;
  habits: Habit[];
  logHabitCompletion: (habitId: number, currentHistory: object) => Promise<void>;
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (newEvent: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  // For features still using local storage
  transactions: Transaction[];
  saveTransactions: (data: Transaction[]) => Promise<void>;
  budgetSettings: BudgetSettings;
  saveBudgetSettings: (data: BudgetSettings) => Promise<void>;
}

const WellauraContext = createContext<WellauraContextType | undefined>(undefined);

export const WellauraProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  
  // States for features still using AsyncStorage
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetSettings, setBudgetSettings] = useState<BudgetSettings>(defaultBudgetSettings);

  // This useEffect fetches all user-specific data from Supabase when they log in
  useEffect(() => {
    if (!user) { // If user logs out, clear their data
      setHabits([]);
      setCalendarEvents([]);
      setIsLoading(false);
      return;
    }

    const loadAllData = async () => {
      setIsLoading(true);
      try {
        // --- FETCH HABITS & CALENDAR FROM SUPABASE ---
        const [habitsResponse, eventsResponse] = await Promise.all([
          supabase.from('habits').select('*').eq('user_id', user.id),
          supabase.from('calendar_events').select('*').eq('user_id', user.id)
        ]);

        if (habitsResponse.error) throw habitsResponse.error;
        setHabits(habitsResponse.data || []);

        if (eventsResponse.error) throw eventsResponse.error;
        if(eventsResponse.data) {
            const formattedEvents = eventsResponse.data.map(e => ({
                ...e,
                start: new Date(e.start_time),
                end: new Date(e.end_time),
            }));
            setCalendarEvents(formattedEvents);
        }

        // --- FETCH OTHER DATA FROM ASYNCSTORAGE (as before) ---
        const [transData, settingsData] = await Promise.all([
          AsyncStorage.getItem(BUDGET_TRANSACTIONS_KEY),
          AsyncStorage.getItem(BUDGET_SETTINGS_KEY),
        ]);
        
        if (transData) setTransactions(JSON.parse(transData));
        if (settingsData) setBudgetSettings(JSON.parse(settingsData));
        
      } catch (e) { console.error("Failed to load global data.", e); }
      finally { setIsLoading(false); }
    };

    loadAllData();
  }, [user]);

  // --- DATABASE-CONNECTED FUNCTIONS ---

  const logHabitCompletion = async (habitId: number, currentHistory: object) => {
    const today = new Date().toISOString().split('T')[0];
    const newHistory = { ...(currentHistory || {}), [today]: { completed: true } };

    setHabits(currentHabits =>
        currentHabits.map(habit =>
            habit.id === habitId ? { ...habit, history: newHistory } : habit
        )
    );

    const { error } = await supabase
        .from('habits')
        .update({ history: newHistory })
        .eq('id', habitId);

    if (error) console.error('Error updating habit:', error);
  };

  const addCalendarEvent = async (newEvent: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    
    const { data, error } = await supabase
        .from('calendar_events')
        .insert({
            user_id: user.id,
            title: newEvent.title,
            start_time: newEvent.start.toISOString(),
            end_time: newEvent.end.toISOString(),
            all_day: newEvent.allDay || false,
        })
        .select()
        .single();

    if (error) {
        console.error('Error adding event:', error);
    } else if (data) {
        setCalendarEvents(currentEvents => [
            ...currentEvents,
            { ...data, start: new Date(data.start_time), end: new Date(data.end_time) }
        ]);
    }
  };

  // --- ASYNCSTORAGE SAVE FUNCTIONS (for other features) ---
  const saveTransactions = async (data: Transaction[]) => { setTransactions(data); await AsyncStorage.setItem(BUDGET_TRANSACTIONS_KEY, JSON.stringify(data)); };
  const saveBudgetSettings = async (data: BudgetSettings) => { setBudgetSettings(data); await AsyncStorage.setItem(BUDGET_SETTINGS_KEY, JSON.stringify(data)); };

  const value = { 
    isLoading, 
    habits, 
    logHabitCompletion,
    calendarEvents,
    addCalendarEvent,
    transactions,
    saveTransactions,
    budgetSettings,
    saveBudgetSettings,
  };

  return (<WellauraContext.Provider value={value}>{children}</WellauraContext.Provider>);
};

export const useWellaura = () => {
  const context = useContext(WellauraContext);
  if (context === undefined) {
    throw new Error('useWellaura must be used within a WellauraProvider');
  }
  return context;
};