import { useState, useCallback } from "react";
import { courseService } from "../services/course.service";
import type { Course, CourseVideo, Enrollment } from "../types/course.types";

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<Enrollment[]>([]);
  const [courseVideos, setCourseVideos] = useState<CourseVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await courseService.getAll();
      setCourses(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load courses.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await courseService.getMyEnrollments();
      setMyEnrollments(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load your enrollments.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCourseVideos = useCallback(async (courseId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await courseService.getCourseVideos(courseId);
      setCourseVideos(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load videos.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    courses, 
    myEnrollments,
    courseVideos,
    loading, 
    error, 
    fetchAllCourses,
    fetchMyEnrollments,
    fetchCourseVideos
  };
}
