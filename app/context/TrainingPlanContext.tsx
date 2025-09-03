import React, { createContext, ReactNode, useContext, useState } from 'react';

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
  assignPlanToClient: (clientId: string, plan: TrainingPlan) => void;
  getClientPlan: (clientId: string) => TrainingPlan | null;
  // highlight-start
  planToSend: string | null;
  setPlanToSend: (planText: string | null) => void;
  // highlight-end
  customPlanInCreation: DayPlan[][];
  setCustomPlanInCreation: React.Dispatch<React.SetStateAction<DayPlan[][]>>;
  resetCustomPlan: () => void;
}

// --- CONTEXT CREATION ---
const TrainingPlanContext = createContext<TrainingPlanContextType | undefined>(undefined);

const createEmptyWeek = (): DayPlan[] => ([
  { dayName: 'Monday', exercises: [] }, { dayName: 'Tuesday', exercises: [] },
  { dayName: 'Wednesday', exercises: [] }, { dayName: 'Thursday', exercises: [] },
  { dayName: 'Friday', exercises: [] }, { dayName: 'Saturday', exercises: [] },
  { dayName: 'Sunday', exercises: [] },
]);

// --- PROVIDER COMPONENT ---
export const TrainingPlanProvider = ({ children }: { children: ReactNode }) => {
  const [assignments, setAssignments] = useState<{ [clientId: string]: TrainingPlan }>({});
  const [customPlanInCreation, setCustomPlanInCreation] = useState<DayPlan[][]>([createEmptyWeek()]);
  // highlight-next-line
  const [planToSend, setPlanToSend] = useState<string | null>(null); // State to hold the plan text

  const assignPlanToClient = (clientId: string, plan: TrainingPlan) => {
    setAssignments(prev => ({ ...prev, [clientId]: plan, }));
  };

  const getClientPlan = (clientId: string): TrainingPlan | null => {
    return assignments[clientId] || null;
  };

  const resetCustomPlan = () => setCustomPlanInCreation([createEmptyWeek()]);

  const value = {
    assignments,
    assignPlanToClient,
    getClientPlan,
    // highlight-start
    planToSend,
    setPlanToSend,
    // highlight-end
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