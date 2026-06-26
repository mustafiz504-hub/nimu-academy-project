export interface Course {
  id: string; // From Postgres
  name: string;
  description: string;
  duration?: string;
  timing?: string;
  mode?: string;
  price: number;
  topics?: string[];
  active?: boolean;
  created_at?: string;
}

export interface CourseVideo {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration_minutes: number;
  order_index: number;
  is_free: boolean;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  created_at: string;
  course_name: string;
  description?: string;
  price?: number;
  duration?: string;
  thumbnail_url?: string;
}

export interface CourseProgress {
  courseId: string;
  completedLessons: string[];
  progressPercent: number;
}
