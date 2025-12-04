import { createContext, useContext, useState } from "react";

// Create Context
const DataContext = createContext();

// Custom hook to use context
export const useData = () => useContext(DataContext);

// Provider Component
export function DataProvider({ children }) {
  
  const [theme, setTheme] = useState("light");

  const value = {    
    setTheme
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}
