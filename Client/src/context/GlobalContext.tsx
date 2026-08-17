import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import {
  api, ApiCourse, ApiUser,
  clearStoredAuth, getStoredToken, getStoredUser, storeAuth,
  SignupInitiatePayload, SignupVerifyPayload,
  LoginInitiatePayload, LoginVerifyPayload,
  OtpResendPayload, OtpInitiateResponse,
} from '../lib/api';

export interface Course {
  id: number;
  title: string;
  description?: string;
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
  user: ApiUser | null;
  setUser: (user: ApiUser | null) => void;
  authLoading: boolean;
  // OTP Auth
  signupInitiate: (data: SignupInitiatePayload) => Promise<OtpInitiateResponse>;
  signupVerify: (data: SignupVerifyPayload) => Promise<ApiUser>;
  loginInitiate: (data: LoginInitiatePayload) => Promise<OtpInitiateResponse>;
  loginVerify: (data: LoginVerifyPayload) => Promise<ApiUser>;
  resendOtp: (data: OtpResendPayload) => Promise<{ message: string }>;
  logout: () => Promise<void>;
  cart: any[];
  setCart: (cart: any[]) => void;
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  coursesLoading: boolean;
  refreshCourses: () => Promise<void>;
  myEnrollments: any[];
  refreshMyEnrollments: () => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

const courseImages = [
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60',
];

export const mapApiCourse = (course: ApiCourse, index = 0): Course => {
  const topics = Array.isArray(course.topics) ? course.topics : [];
  const price = String(course.price ?? '').replace(/\.00$/, '');
  const mode = course.mode || 'Online & Offline';

  return {
    id: course.id,
    title: course.name,
    description: course.description || '',
    price,
    duration: course.duration || 'Flexible',
    timing: course.timing || 'Contact for batch timing',
    days: course.timing?.includes('Sat') || course.timing?.includes('Sun') ? 'Weekend' : 'Weekday',
    image: courseImages[index % courseImages.length],
    mode: mode.toUpperCase(),
    topics,
    learn: topics.length ? topics : ['Hands-on baking practice', 'Professional techniques', 'Recipe guidance'],
    instructor: { name: 'Chef Muskan Naz', bio: 'Expert in French Pastry & Artisan Baking' },
    batches: course.timing ? course.timing.split('/').map((item) => item.trim()) : ['Contact counselor for timings'],
  };
};

const fallbackCourses: Course[] = [
  {
    id: 1,
    title: 'Basic Baking Course',
    price: '4999',
    duration: '4 Weeks',
    timing: '10 AM - 12 PM / 5 PM - 7 PM',
    days: 'Sat - Sun',
    mode: 'ONLINE & OFFLINE',
    topics: ['Cake Basics', 'Frosting Techniques', 'Cupcakes'],
    learn: ['Master eggless sponge making', 'Learn 5 types of frosting', 'Bakery style decoration'],
    instructor: { name: 'Chef Muskan Naz', bio: 'Expert in French Pastry & Artisan Baking' },
    batches: ['Morning: 10 AM - 12 PM', 'Evening: 5 PM - 7 PM'],
    image: courseImages[0],
  },
  {
    id: 2,
    title: 'Advanced Cake Decorating',
    price: '9999',
    duration: '6 Weeks',
    timing: 'Sat & Sun 11 AM - 3 PM',
    days: 'Sat - Sun',
    mode: 'OFFLINE ONLY',
    topics: ['Fondant Art', 'Wedding Cake Design', 'Tier Cakes'],
    learn: ['Professional fondant work', 'Multi-tier cake structure', 'Exotic flower modeling'],
    instructor: { name: 'Chef Muskan Naz', bio: 'Expert in Wedding Cakes & Fondant Art' },
    batches: ['Weekend: 11 AM - 3 PM'],
    image: courseImages[1],
  },
  {
    id: 3,
    title: 'Eggless Baking Program',
    price: '2999',
    duration: '3 Weeks',
    timing: 'Daily 6 PM - 9:30 PM',
    days: 'Mon - Fri',
    mode: 'ONLINE ONLY',
    topics: ['Eggless Sponges', 'Healthy Alternatives', 'Vegan Baking Basics'],
    learn: ['100% eggless recipes', 'Sugar-free baking options', 'Dairy-free alternatives'],
    instructor: { name: 'Chef Muskan Naz', bio: 'Pioneer in Eggless Healthy Baking' },
    batches: ['Online: 6 PM - 9:30 PM'],
    image: courseImages[2],
  },
];

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ApiUser | null>(() => getStoredUser());
  const [authLoading, setAuthLoading] = useState(Boolean(getStoredToken()));
  const [cart, setCart] = useState([]);
  const [courses, setCourses] = useState<Course[]>(fallbackCourses);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [myEnrollments, setMyEnrollments] = useState<any[]>([]);

  const refreshMyEnrollments = useCallback(async () => {
    if (!getStoredToken()) return;
    try {
      const response = await api.user.enrollments();
      setMyEnrollments(response.enrollments);
    } catch (error) {
      console.error('Unable to load enrollments:', error);
      setMyEnrollments([]);
    }
  }, []);

  const refreshCourses = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const response = await api.courses.list();
      setCourses(response.courses.map(mapApiCourse));
    } catch (error) {
      console.error('Unable to load courses:', error);
      setCourses(fallbackCourses);
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCourses();
  }, [refreshCourses]);

  useEffect(() => {
    const hydrateUser = async () => {
      if (!getStoredToken()) {
        setAuthLoading(false);
        return;
      }

      try {
        const response = await api.auth.me();
        setUser(response.user);
        storeAuth(getStoredToken() || '', response.user);
        refreshMyEnrollments();
      } catch {
        clearStoredAuth();
        setUser(null);
        setMyEnrollments([]);
      } finally {
        setAuthLoading(false);
      }
    };

    hydrateUser();
  }, [refreshMyEnrollments]);

  // ── OTP Auth Methods ──────────────────────────────────────────────────────────

  const signupInitiate = useCallback(async (data: SignupInitiatePayload) => {
    return api.auth.signupInitiate(data);
  }, []);

  const signupVerify = useCallback(async (data: SignupVerifyPayload) => {
    const response = await api.auth.signupVerify(data);
    storeAuth(response.token, response.user);
    setUser(response.user);
    refreshMyEnrollments();
    return response.user;
  }, [refreshMyEnrollments]);

  const loginInitiate = useCallback(async (data: LoginInitiatePayload) => {
    return api.auth.loginInitiate(data);
  }, []);

  const loginVerify = useCallback(async (data: LoginVerifyPayload) => {
    const response = await api.auth.loginVerify(data);
    storeAuth(response.token, response.user);
    setUser(response.user);
    refreshMyEnrollments();
    return response.user;
  }, [refreshMyEnrollments]);

  const resendOtp = useCallback(async (data: OtpResendPayload) => {
    return api.auth.resendOtp(data);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } finally {
      clearStoredAuth();
      setUser(null);
      setMyEnrollments([]);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      authLoading,
      signupInitiate,
      signupVerify,
      loginInitiate,
      loginVerify,
      resendOtp,
      logout,
      cart,
      setCart,
      courses,
      setCourses,
      coursesLoading,
      refreshCourses,
      myEnrollments,
      refreshMyEnrollments,
    }),
    [user, authLoading, signupInitiate, signupVerify, loginInitiate, loginVerify, resendOtp, logout, cart, courses, coursesLoading, refreshCourses, myEnrollments, refreshMyEnrollments]
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
