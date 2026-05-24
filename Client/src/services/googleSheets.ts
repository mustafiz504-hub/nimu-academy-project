/**
 * Certificate student service — backed by Supabase/PostgreSQL via the Express API.
 * Google Sheets has been removed. All CRUD now goes through /api/students.
 *
 * The exported shape (fetchStudents, addStudent, updateStudent) is kept compatible
 * so that components that still reference googleSheetsService work without changes.
 */
import { api, ApiStudent } from '../lib/api';
import { Student } from '../types/student';

export type { Student };

/** Map from DB snake_case row → frontend Student shape */
const toStudent = (s: ApiStudent): Student => ({
  studentId:      s.student_id,
  studentName:    s.student_name,
  email:          s.email,
  phone:          s.phone,
  courseName:     s.course_name,
  approved:       s.approved,
  completed:      s.completed,
  completionDate: s.completion_date,
  certificateId:  s.certificate_id,
});

export const googleSheetsService = {
  /** Fetch all students — admin panel use */
  async fetchStudents(): Promise<Student[]> {
    try {
      const { students } = await api.students.list();
      return students.map(toStudent);
    } catch (error) {
      console.error('fetchStudents error:', error);
      return [];
    }
  },

  /**
   * Search for a single student by phone / email / studentId.
   * Used by CertificateSearch (public page).
   */
  async searchStudent(query: string): Promise<Student | null> {
    try {
      const { student } = await api.students.search(query);
      return toStudent(student);
    } catch {
      return null;
    }
  },

  /** Add a new student — admin panel "Add Student" form */
  async addStudent(data: {
    studentName: string;
    phone: string;
    email?: string;
    courseName?: string;
    completionDate?: string;
  }): Promise<{ success: boolean; student?: Student }> {
    try {
      const { student } = await api.students.create({
        student_name:    data.studentName,
        phone:           data.phone,
        email:           data.email || '',
        course_name:     data.courseName || '',
        completion_date: data.completionDate || '',
      });
      return { success: true, student: toStudent(student) };
    } catch (error: any) {
      console.error('addStudent error:', error);
      return { success: false };
    }
  },

  /**
   * Update student fields — used to approve / mark complete.
   * @param dbId  numeric `id` column (not student_id string)
   */
  async updateStudent(
    dbId: number,
    updates: {
      approved?: boolean;
      completed?: boolean;
      completionDate?: string;
    }
  ): Promise<{ success: boolean; student?: Student }> {
    try {
      const body: Record<string, unknown> = {};
      if (updates.approved  !== undefined) body['approved']        = updates.approved;
      if (updates.completed !== undefined) body['completed']       = updates.completed;
      if (updates.completionDate)          body['completion_date'] = updates.completionDate;

      const { student } = await api.students.update(dbId, body as any);
      return { success: true, student: toStudent(student) };
    } catch (error) {
      console.error('updateStudent error:', error);
      return { success: false };
    }
  },

  /** Delete a student record — admin panel */
  async deleteStudent(dbId: number): Promise<boolean> {
    try {
      await api.students.delete(dbId);
      return true;
    } catch {
      return false;
    }
  },
};
