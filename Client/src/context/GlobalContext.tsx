import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GlobalContextType {
  user: any;
  setUser: (user: any) => void;
  cart: any[];
  setCart: (cart: any[]) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);

  return (
    <GlobalContext.Provider value={{ user, setUser, cart, setCart }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
};
