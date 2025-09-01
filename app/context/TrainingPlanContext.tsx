import { createContext, useContext, useState } from 'react';

const TrainingPlanContext = createContext(null);

const createEmptyWeek = () => ({
  Monday: null, Tuesday: null, Wednesday: null, Thursday: null, Friday: null, Saturday: null, Sunday: null,
});

export const TrainingPlanProvider = ({ children }) => {
  const [activePlan, setActivePlan] = useState(null); 
  const [activePlanMeta, setActivePlanMeta] = useState({ name: null, isCustom: false });
  const [customPlanInCreation, setCustomPlanInCreation] = useState([createEmptyWeek()]);

  const value = {
    activePlan,
    setActivePlan,
    activePlanMeta,
    setActivePlanMeta,
    customPlanInCreation,
    setCustomPlanInCreation,
    resetCustomPlan: () => setCustomPlanInCreation([createEmptyWeek()]),
  };

  return (
    <TrainingPlanContext.Provider value={value}>
      {children}
    </TrainingPlanContext.Provider>
  );
};

export const useTrainingPlan = () => {
  const context = useContext(TrainingPlanContext);
  if (context === null) {
      throw new Error("useTrainingPlan must be used within a TrainingPlanProvider");
  }
  return context;
};