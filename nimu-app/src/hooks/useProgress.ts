import { useState, useEffect } from "react";
import { courseService } from "../services/course.service";
import type { Course, Enrollment } from "../types/course.types";

export function useProgress() {
  const [enrolledCourses, setEnrolledCourses] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        const data = await courseService.getMyEnrollments();
        setEnrolledCourses(data);
      } catch {
        // silently fail — user may not be enrolled
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  const overallProgress =
    enrolledCourses.length === 0
      ? 0
      : Math.round(
          enrolledCourses.reduce((sum, _) => sum + 0, 0) / enrolledCourses.length
        );

  return { enrolledCourses, loading, overallProgress };
}
