
import React from 'react';
import { useSimulation } from '@/hooks/useSimulation';

// Create context for the simulation
export const SimulationContext = React.createContext<ReturnType<typeof useSimulation> | null>(null);

export const SimulationProvider = ({ children }: { children: React.ReactNode }) => {
  const simulation = useSimulation();
  
  return (
    <SimulationContext.Provider value={simulation}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulationContext = () => {
  const context = React.useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulationContext must be used within a SimulationProvider');
  }
  return context;
};
