import { create } from "zustand";
import { courseService } from "../services/course.service";
import type { Course, CourseVideo, Enrollment } from "../types/course.types";

interface CourseState {
  courses: Course[];
  myEnrollments: Enrollment[];
  courseDetails: Record<string, Course>;       // Cache individual course by ID
  courseVideos: Record<string, CourseVideo[]>;  // Cache videos by course ID
  lastPlayedVideo: Record<string, CourseVideo>; // Last played video per course ID

  loadingCourses: boolean;
  loadingEnrollments: boolean;
  loadingVideos: boolean;
  loadingDetail: boolean;

  // Pull-to-refresh flags (separate from initial load)
  refreshingCourses: boolean;
  refreshingEnrollments: boolean;
  refreshingDetail: boolean;

  // ── Cache-hit flags (true after first successful fetch) ─────────────────
  // Using flags instead of array.length so empty results are also cached.
  hasFetchedCourses: boolean;
  hasFetchedEnrollments: boolean;

  error: string | null;

  fetchAllCourses: () => Promise<void>;              // uses cache
  fetchMyEnrollments: () => Promise<void>;           // uses cache
  fetchCourseVideos: (courseId: string) => Promise<void>; // uses cache
  fetchCourseDetail: (courseId: string) => Promise<void>; // uses cache

  refreshAllCourses: () => Promise<void>;            // force-refetch
  refreshMyEnrollments: () => Promise<void>;         // force-refetch
  refreshCourseDetail: (courseId: string) => Promise<void>; // force-refetch
  refreshCourseVideos: (courseId: string) => Promise<void>; // force-refetch

  setLastPlayedVideo: (courseId: string, video: CourseVideo) => void; // remember last video
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  myEnrollments: [],
  courseDetails: {},
  courseVideos: {},
  lastPlayedVideo: {},

  loadingCourses: false,
  loadingEnrollments: false,
  loadingVideos: false,
  loadingDetail: false,

  refreshingCourses: false,
  refreshingEnrollments: false,
  refreshingDetail: false,

  hasFetchedCourses: false,
  hasFetchedEnrollments: false,

  error: null,

  fetchAllCourses: async () => {
    const { hasFetchedCourses } = get();
    if (hasFetchedCourses) return; // already cached — skip

    try {
      set({ loadingCourses: true, error: null });
      const data = await courseService.getAll();
      set({ courses: data, loadingCourses: false, hasFetchedCourses: true });
    } catch (err: any) {
      set({ error: err?.response?.data?.message || "Failed to load courses.", loadingCourses: false });
    }
  },

  fetchMyEnrollments: async () => {
    const { hasFetchedEnrollments } = get();
    if (hasFetchedEnrollments) return; // already cached — skip even if empty

    try {
      set({ loadingEnrollments: true, error: null });
      const data = await courseService.getMyEnrollments();
      set({ myEnrollments: data, loadingEnrollments: false, hasFetchedEnrollments: true });
    } catch (err: any) {
      set({ error: err?.response?.data?.message || "Failed to load your enrollments.", loadingEnrollments: false });
    }
  },

  // ── Fetch individual course detail (cached) ─────────────────────────────
  fetchCourseDetail: async (courseId: string) => {
    const { courseDetails } = get();
    if (courseDetails[courseId]) return; // use cache

    try {
      set({ loadingDetail: true, error: null });
      const data = await courseService.getById(courseId);
      set((state) => ({
        courseDetails: { ...state.courseDetails, [courseId]: data },
        loadingDetail: false,
      }));
    } catch (err: any) {
      set({ error: err?.response?.data?.message || "Failed to load course.", loadingDetail: false });
    }
  },

  fetchCourseVideos: async (courseId: string) => {
    const { courseVideos } = get();
    if (courseVideos[courseId]) return;

    try {
      set({ loadingVideos: true, error: null });
      const data = await courseService.getCourseVideos(courseId);
      set((state) => ({
        courseVideos: { ...state.courseVideos, [courseId]: data },
        loadingVideos: false,
      }));
    } catch (err: any) {
      set({ error: err?.response?.data?.message || "Failed to load videos.", loadingVideos: false });
    }
  },

  // ── Pull-to-refresh: always hits the network ─────────────────────────────
  refreshAllCourses: async () => {
    try {
      set({ refreshingCourses: true, error: null });
      const data = await courseService.getAll();
      set({ courses: data, refreshingCourses: false, hasFetchedCourses: true });
    } catch (err: any) {
      set({ error: err?.response?.data?.message || "Failed to refresh courses.", refreshingCourses: false });
    }
  },

  refreshMyEnrollments: async () => {
    try {
      set({ refreshingEnrollments: true, error: null });
      const data = await courseService.getMyEnrollments();
      set({ myEnrollments: data, refreshingEnrollments: false, hasFetchedEnrollments: true });
    } catch (err: any) {
      set({ error: err?.response?.data?.message || "Failed to refresh enrollments.", refreshingEnrollments: false });
    }
  },

  refreshCourseDetail: async (courseId: string) => {
    try {
      set({ refreshingDetail: true, error: null });
      const data = await courseService.getById(courseId);
      set((state) => ({
        courseDetails: { ...state.courseDetails, [courseId]: data },
        refreshingDetail: false,
      }));
    } catch (err: any) {
      set({ error: err?.response?.data?.message || "Failed to refresh course.", refreshingDetail: false });
    }
  },

  refreshCourseVideos: async (courseId: string) => {
    try {
      set({ refreshingDetail: true, error: null });
      const data = await courseService.getCourseVideos(courseId);
      set((state) => ({
        courseVideos: { ...state.courseVideos, [courseId]: data },
        refreshingDetail: false,
      }));
    } catch (err: any) {
      set({ error: err?.response?.data?.message || "Failed to refresh videos.", refreshingDetail: false });
    }
  },

  setLastPlayedVideo: (courseId: string, video: CourseVideo) => {
    set((state) => ({
      lastPlayedVideo: { ...state.lastPlayedVideo, [courseId]: video },
    }));
  },
}));
