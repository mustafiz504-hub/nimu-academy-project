import { create } from "zustand";
import { progressService, MyProgressResponse, CourseProgressResponse } from "../services/progress.service";

interface ProgressState {
  myProgress: MyProgressResponse | null;
  courseProgress: Record<string, CourseProgressResponse>;
  loading: boolean;
  error: string | null;

  fetchMyProgress: () => Promise<void>;
  fetchCourseProgress: (courseId: string) => Promise<void>;
  markVideoWatched: (videoId: string, courseId: string) => Promise<void>;
  reset: () => void;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  myProgress: null,
  courseProgress: {},
  loading: false,
  error: null,

  fetchMyProgress: async () => {
    try {
      set({ loading: true, error: null });
      const data = await progressService.getMyProgress();
      set({ myProgress: data, loading: false });
    } catch (err: any) {
      set({ error: err?.response?.data?.message || "Failed to load progress.", loading: false });
    }
  },

  fetchCourseProgress: async (courseId: string) => {
    try {
      const data = await progressService.getCourseProgress(courseId);
      set((state) => ({
        courseProgress: { ...state.courseProgress, [courseId]: data },
      }));
    } catch (err: any) {
      // Silently fail — not critical
    }
  },

  markVideoWatched: async (videoId: string, courseId: string) => {
    try {
      await progressService.markVideoWatched(videoId, courseId);
      // Refresh course progress after marking
      const data = await progressService.getCourseProgress(courseId);
      set((state) => ({
        courseProgress: { ...state.courseProgress, [courseId]: data },
      }));
      // Also refresh overall progress
      const overall = await progressService.getMyProgress();
      set({ myProgress: overall });
    } catch (err: any) {
      // Silently fail — tracking is non-blocking
    }
  },

  reset: () => set({ myProgress: null, courseProgress: {}, loading: false, error: null }),
}));
