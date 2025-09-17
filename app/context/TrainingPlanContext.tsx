import React, { createContext, ReactNode, useContext, useState } from 'react';
import { supabase } from '../../lib/supabase'; // Make sure this path is correct

// --- TYPE DEFINITIONS ---
interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
}

interface DayPlan {
  dayName: string;
  focus: string;
  exercises: Exercise[];
}

interface TrainingPlan {
  id: string;
  name: string;
  weeks: DayPlan[][];
}

interface TrainingPlanContextType {
  assignments: { [clientId: string]: TrainingPlan };
  assignPlanToClient: (clientId: string, plan: TrainingPlan) => Promise<void>;
  getClientPlan: (clientId: string) => TrainingPlan | null;
  fetchClientPlan: (clientId: string) => Promise<void>;
  planToSend: string | null;
  setPlanToSend: (planText: string | null) => void;
  customPlanInCreation: DayPlan[][];
  setCustomPlanInCreation: React.Dispatch<React.SetStateAction<DayPlan[][]>>;
  resetCustomPlan: () => void;
}

// --- CONTEXT CREATION ---
const TrainingPlanContext = createContext<TrainingPlanContextType | undefined>(undefined);

// Helper function to create an empty week structure
const createEmptyWeek = (): DayPlan[] => ([
  { dayName: 'Monday', focus: '', exercises: [] },
  { dayName: 'Tuesday', focus: '', exercises: [] },
  { dayName: 'Wednesday', focus: '', exercises: [] },
  { dayName: 'Thursday', focus: '', exercises: [] },
  { dayName: 'Friday', focus: '', exercises: [] },
  { dayName: 'Saturday', focus: '', exercises: [] },
  { dayName: 'Sunday', focus: '', exercises: [] },
]);


// --- PROVIDER COMPONENT ---
export const TrainingPlanProvider = ({ children }: { children: ReactNode }) => {
  // This state now acts as a temporary cache for performance.
  const [assignments, setAssignments] = useState<{ [clientId: string]: TrainingPlan }>({});
  const [planToSend, setPlanToSend] = useState<string | null>(null);
  const [customPlanInCreation, setCustomPlanInCreation] = useState<DayPlan[][]>([createEmptyWeek()]);

  // Assigns or updates a plan for a specific client in the database
  const assignPlanToClient = async (clientId: string, plan: TrainingPlan) => {
    // Optimistic UI Update: Update the local state immediately
    setAssignments(prev => ({
      ...prev,
      [clientId]: plan,
    }));

    // Use .upsert() to INSERT a new plan or UPDATE the existing one for the client
    const { error } = await supabase
      .from('training_plans')
      .upsert({
        assigned_to_client_id: clientId,
        plan_name: plan.name,
        plan_data: plan // The entire plan object is saved in the JSONB column
      })
      .eq('assigned_to_client_id', clientId);

    if (error) {
      console.error("Error assigning plan in Supabase:", error);
    } else {
      console.log(`Plan "${plan.name}" successfully saved for client ${clientId}`);
    }
  };
  
  // Fetches a specific client's plan from the database and caches it
  const fetchClientPlan = async (clientId: string) => {
    const { data, error } = await supabase
        .from('training_plans')
        .select('plan_data')
        .eq('assigned_to_client_id', clientId)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is okay
        console.error("Error fetching client plan:", error);
        return;
    }

    if (data && data.plan_data) {
        setAssignments(prev => ({
            ...prev,
            [clientId]: data.plan_data as TrainingPlan,
        }));
    }
  };

  // Reads the plan from the local cache
  const getClientPlan = (clientId: string): TrainingPlan | null => {
    return assignments[clientId] || null;
  };

  const resetCustomPlan = () => setCustomPlanInCreation([createEmptyWeek()]);

  const value = {
    assignments,
    assignPlanToClient,
    getClientPlan,
    fetchClientPlan,
    planToSend,
    setPlanToSend,
    customPlanInCreation,
    setCustomPlanInCreation,
    resetCustomPlan,
  };

  return (
    <TrainingPlanContext.Provider value={value}>
      {children}
    </TrainingPlanContext.Provider>
  );
};


// --- CUSTOM HOOK ---
export const useTrainingPlan = () => {
  const context = useContext(TrainingPlanContext);
  if (context === undefined) {
      throw new Error("useTrainingPlan must be used within a TrainingPlanProvider");
  }
  return context;
};