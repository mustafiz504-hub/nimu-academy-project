import axios from "axios";
import api from "./api";
import { ENDPOINTS } from "../constants/api";
import type { Course, CourseVideo } from "../types/course.types";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface AdminStats {
  totalOrders: number;
  totalEnrollments: number;
  totalUsers: number;
  totalRevenue: number;
  pendingOrders: number;
  pendingEnrollments: number;
}

export interface AdminEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  course_name: string;
  student_name: string;
  phone: string;
  email?: string;
  city?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  created_at: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "admin";
  created_at: string;
}

export interface AdminOrder {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  user_name: string;
  user_email: string;
  quantity: number;
  total_price: number;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  created_at: string;
}

export interface Student {
  id: string;
  student_name: string;
  phone: string;
  email?: string;
  course_name: string;
  completion_date?: string;
  approved: boolean;
  completed: boolean;
  student_id?: string;
}

// ── Admin API ─────────────────────────────────────────────────────────────────
export const adminService = {
  // Dashboard
  async getDashboard(): Promise<AdminStats> {
    const { data } = await api.get<{ stats: AdminStats }>("/admin/dashboard");
    return data.stats;
  },

  // Enrollments
  async getEnrollments(): Promise<AdminEnrollment[]> {
    const { data } = await api.get<{ enrollments: AdminEnrollment[] }>("/admin/enrollments");
    return data.enrollments;
  },
  async updateEnrollmentStatus(id: string, status: string): Promise<void> {
    await api.put(`/admin/enrollments/${id}/status`, { status });
  },

  // Orders
  async getOrders(): Promise<AdminOrder[]> {
    const { data } = await api.get<{ orders: AdminOrder[] }>("/admin/orders");
    return data.orders;
  },
  async updateOrderStatus(id: string, status: string): Promise<void> {
    await api.put(`/admin/orders/${id}/status`, { status });
  },

  // Users
  async getUsers(): Promise<AdminUser[]> {
    const { data } = await api.get<{ users: AdminUser[] }>("/admin/users");
    return data.users;
  },
  async makeAdmin(userId: string): Promise<void> {
    await api.post("/admin/make-admin", { userId });
  },
  async removeAdmin(userId: string): Promise<void> {
    await api.post("/admin/remove-admin", { userId });
  },

  // Students (certificate management)
  async getStudents(): Promise<Student[]> {
    const { data } = await api.get<{ students: Student[] }>("/students");
    return data.students;
  },
  async createStudent(data: {
    student_name: string;
    phone: string;
    email?: string;
    course_name: string;
    completion_date?: string;
  }): Promise<Student> {
    const { data: res } = await api.post<{ student: Student }>("/students", data);
    return res.student;
  },
  async updateStudent(id: string, updates: Partial<{ approved: boolean; completed: boolean; completion_date: string; course_name: string }>): Promise<void> {
    await api.put(`/students/${id}`, updates);
  },
  async deleteStudent(id: string): Promise<void> {
    await api.delete(`/students/${id}`);
  },

  // Courses
  async createCourse(data: {
    name: string;
    description?: string;
    duration?: string;
    price: number;
    mode?: string;
  }): Promise<Course> {
    const { data: res } = await api.post<{ course: Course }>(ENDPOINTS.courses, data);
    return res.course;
  },

  // Videos
  async addVideo(
    courseId: string,
    data: {
      title: string;
      description?: string;
      video_url: string;
      thumbnail_url?: string;
      duration_minutes?: number;
      is_free?: boolean;
    }
  ): Promise<CourseVideo> {
    const { data: res } = await api.post<{ video: CourseVideo }>(
      `${ENDPOINTS.courses}/${courseId}/videos`,
      data
    );
    return res.video;
  },
  async deleteVideo(courseId: string, videoId: string): Promise<void> {
    await api.delete(`${ENDPOINTS.courses}/${courseId}/videos/${videoId}`);
  },

  // Upload Media
  async uploadMediaToCloudinary(fileUri: string, type: 'video' | 'image', folder: string = 'courses', onProgress?: (progress: number) => void): Promise<string> {

    console.log(`\n🚀 [Upload] Starting ${type} upload`);
    console.log(`   URI: ${fileUri}`);
    console.log(`   Folder: ${folder}`);

    // ── Step 1: Get signed upload params from server ──────────────────────────
    console.log(`\n🔑 [Upload] Fetching signature from server...`);
    const { data: sig } = await api.get<{
      signature: string;
      timestamp: number;
      cloudName: string;
      apiKey: string;
      folder: string;
    }>(`/upload/signature?folder=${folder}`);

    console.log(`   cloudName: ${sig.cloudName}`);
    console.log(`   folder: ${sig.folder}`);
    console.log(`   timestamp: ${sig.timestamp}`);
    console.log(`   signature: ${sig.signature?.slice(0, 20)}...`);

    const endpoint = type === 'video'
      ? `https://api.cloudinary.com/v1_1/${sig.cloudName}/video/upload`
      : `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`;

    console.log(`\n☁️  [Cloudinary] Endpoint: ${endpoint}`);

    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: type === 'video' ? 'video/mp4' : 'image/jpeg',
      name: type === 'video' ? 'upload.mp4' : 'upload.jpg',
    } as any);
    formData.append('api_key', sig.apiKey);
    formData.append('timestamp', sig.timestamp.toString());
    formData.append('signature', sig.signature);
    formData.append('folder', sig.folder);

    console.log(`   FormData fields: file, api_key, timestamp, signature, folder`);

    try {
      console.log(`\n📤 [Cloudinary] Sending request...`);
      const res = await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 15 * 60 * 1000,
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(pct);
            if (pct % 10 === 0) console.log(`   Progress: ${pct}%`);
          }
        },
      });
      console.log(`\n✅ [Cloudinary] SUCCESS! URL: ${res.data.secure_url}`);
      return res.data.secure_url;
    } catch (err: any) {
      console.error(`\n❌ [Cloudinary] UPLOAD FAILED`);
      console.error(`   HTTP Status: ${err.response?.status}`);
      console.error(`   Error message: ${err.message}`);
      console.error(`   Cloudinary error: ${JSON.stringify(err.response?.data)}`);
      console.error(`   Axios code: ${err.code}`);
      throw new Error(
        err.response?.data?.error?.message || err.message || 'Failed to upload to Cloudinary'
      );
    }
  },
};
