import React, { createContext, useContext, useState } from 'react';

interface DataRefreshContextType {
  refreshVersion: number;
  triggerRefresh: () => void;
}

const DataRefreshContext = createContext<DataRefreshContextType | undefined>(undefined);

export const DataRefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshVersion, setRefreshVersion] = useState(0);

  const triggerRefresh = () => setRefreshVersion(v => v + 1);

  return (
    <DataRefreshContext.Provider value={{ refreshVersion, triggerRefresh }}>
      {children}
    </DataRefreshContext.Provider>
  );
};

export const useDataRefresh = () => {
  const context = useContext(DataRefreshContext);
  if (!context) throw new Error('useDataRefresh must be used within a DataRefreshProvider');
  return context;
}; 