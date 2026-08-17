import api from "./api";
import { ENDPOINTS } from "../constants/api";

export interface CourseProgressData {
  course_id: number;
  course_name: string;
  total_videos: number;
  watched_count: number;
  percent: number;
}

export interface MyProgressResponse {
  overall_percent: number;
  total_watched: number;
  total_videos: number;
  courses: CourseProgressData[];
}

export interface CourseProgressResponse {
  watched_video_ids: number[];
  watched: number;
  total: number;
  percent: number;
}

export const progressService = {
  /** GET /api/progress/my — overall progress across all enrolled courses */
  async getMyProgress(): Promise<MyProgressResponse> {
    const { data } = await api.get<MyProgressResponse>(ENDPOINTS.myProgress);
    return data;
  },

  /** GET /api/progress/course/:courseId — per-course watched video IDs */
  async getCourseProgress(courseId: string): Promise<CourseProgressResponse> {
    const { data } = await api.get<CourseProgressResponse>(ENDPOINTS.courseProgress(courseId));
    return data;
  },

  /** POST /api/progress/video/:videoId — mark a video as watched */
  async markVideoWatched(videoId: string, courseId: string): Promise<void> {
    await api.post(ENDPOINTS.markVideoWatched(videoId), { course_id: courseId });
  },
};
