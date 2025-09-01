import { createContext, ReactNode, useContext, useState } from 'react';

// Define the shape of the context data
interface CycleInfo {
  phaseForToday: string;
  dayOfCycle: number;
  lastCycleStart: string | null;
}

interface CycleContextType {
  cycleInfo: CycleInfo;
}

// Create the context with a default value
const CycleContext = createContext<CycleContextType | undefined>(undefined);

// Create the Provider component using a named export
export const CycleProvider = ({ children }: { children: ReactNode }) => {
  // --- STATE ---
  // Using placeholder data for now.
  const [cycleInfo, setCycleInfo] = useState<CycleInfo>({
    phaseForToday: 'Follicular',
    dayOfCycle: 7,
    lastCycleStart: new Date().toISOString(),
  });

  const value = {
    cycleInfo,
  };

  return (
    <CycleContext.Provider value={value}>
      {children}
    </CycleContext.Provider>
  );
};

// Create the custom hook using a named export
export const useCycle = () => {
  const context = useContext(CycleContext);
  if (context === undefined) {
    throw new Error('useCycle must be used within a CycleProvider');
  }
  return context;
};
