import api from "./api";
import { ENDPOINTS } from "../constants/api";
import type { Course, CourseVideo, Enrollment } from "../types/course.types";

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

  // GET /api/courses/:id/videos
  async getCourseVideos(id: string): Promise<CourseVideo[]> {
    const { data } = await api.get<{ videos: CourseVideo[] }>(`${ENDPOINTS.courses}/${id}/videos`);
    return data.videos;
  },
};
