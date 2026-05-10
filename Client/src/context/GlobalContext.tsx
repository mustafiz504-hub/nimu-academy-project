import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';

export interface Course {
  id: number;
  title: string;
  price: string;
  duration: string;
  timing: string;
  days: string;
  image: string;
  mode: string;
  topics: string[];
  learn?: string[];
  batches?: string[];
  instructor?: {
    name: string;
    bio: string;
  };
}

interface GlobalContextType {
  user: any;
  setUser: (user: any) => void;
  cart: any[];
  setCart: (cart: any[]) => void;
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [courses, setCourses] = useState<Course[]>([
    { 
      id: 1, 
      title: 'Basic Baking Course', 
      price: '4,999', 
      duration: '4 Weeks', 
      timing: '10 AM - 12 PM / 5 PM - 7 PM', 
      days: 'Sat - Sun',
      mode: 'ONLINE & OFFLINE',
      topics: ['Cake Basics', 'Frosting Techniques', 'Cupcakes'],
      learn: ['Master eggless sponge making', 'Learn 5 types of frosting', 'Bakery style decoration'],
      instructor: { name: 'Chef Muskan Naz', bio: 'Expert in French Pastry & Artisan Baking' },
      batches: ['Morning: 10 AM - 12 PM', 'Evening: 5 PM - 7 PM'],
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60' 
    },
    { 
      id: 2, 
      title: 'Advanced Cake Decorating', 
      price: '9,999', 
      duration: '6 Weeks', 
      timing: 'Sat & Sun 11 AM - 3 PM', 
      days: 'Sat - Sun',
      mode: 'OFFLINE ONLY',
      topics: ['Fondant Art', 'Wedding Cake Design', 'Tier Cakes'],
      learn: ['Professional fondant work', 'Multi-tier cake structure', 'Exotic flower modeling'],
      instructor: { name: 'Chef Muskan Naz', bio: 'Expert in Wedding Cakes & Fondant Art' },
      batches: ['Weekend: 11 AM - 3 PM'],
      image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=500&auto=format&fit=crop&q=60' 
    },
    { 
      id: 3, 
      title: 'Eggless Baking Program', 
      price: '2,999', 
      duration: '3 Weeks', 
      timing: 'Daily 6 PM - 9:30 PM', 
      days: 'Mon - Fri',
      mode: 'ONLINE ONLY',
      topics: ['Eggless Sponges', 'Healthy Alternatives', 'Vegan Baking Basics'],
      learn: ['100% eggless recipes', 'Sugar-free baking options', 'Dairy-free alternatives'],
      instructor: { name: 'Chef Muskan Naz', bio: 'Pioneer in Eggless Healthy Baking' },
      batches: ['Online: 6 PM - 9:30 PM'],
      image: 'https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?w=500&auto=format&fit=crop&q=60' 
    },
  ]);

  const value = useMemo(
    () => ({ user, setUser, cart, setCart, courses, setCourses }),
    [user, cart, courses]
  );

  return (
    <GlobalContext.Provider value={value}>
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
