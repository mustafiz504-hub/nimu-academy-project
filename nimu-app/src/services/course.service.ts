import api from "./api";
import { ENDPOINTS } from "../constants/api";
import type { Course, CourseVideo, Enrollment } from "../types/course.types";

export interface CourseVideosResponse {
  videos: CourseVideo[];
  isEnrolled: boolean;
  canAccessAll: boolean;
}

export const courseService = {
  // GET /api/courses
  async getAll(): Promise<Course[]> {
    const { data } = await api.get<{ courses: Course[] }>(ENDPOINTS.courses);
    return data.courses;
  },

  // GET /api/courses/:id
  async getById(id: string): Promise<Course> {
    const { data } = await api.get<{ course: Course }>(ENDPOINTS.courseDetail(id));
    return data.course;
  },

  // GET /api/enrollments/my
  async getMyEnrollments(): Promise<Enrollment[]> {
    const { data } = await api.get<{ enrollments: Enrollment[] }>(ENDPOINTS.myEnrollments);
    return data.enrollments;
  },

  // GET /api/courses/:id/videos — returns videos + access flags
  async getCourseVideos(id: string): Promise<CourseVideosResponse> {
    const { data } = await api.get<CourseVideosResponse>(`${ENDPOINTS.courses}/${id}/videos`);
    return data;
  },
};
