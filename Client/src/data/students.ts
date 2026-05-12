import { Student } from '../types/student';

/**
 * Static student data for initial development or fallback.
 * In production, data is fetched dynamically from Google Sheets.
 */
export const mockStudents: Student[] = [
  {
    studentId: "STU-001",
    studentName: "Sneha Kapoor",
    email: "sneha@gmail.com",
    phone: "9876543210",
    courseName: "Advanced Cake Decorating",
    approved: true,
    completed: true,
    completionDate: "10 May 2026",
    certificateId: "NIMU-2026-001"
  },
  {
    studentId: "STU-002",
    studentName: "Rohan Mehra",
    email: "rohan@gmail.com",
    phone: "9123456780",
    courseName: "Professional Chocolatier",
    approved: true,
    completed: true,
    completionDate: "12 May 2026",
    certificateId: "NIMU-2026-002"
  },
  {
    studentId: "STU-003",
    studentName: "Priya Das",
    email: "priya@gmail.com",
    phone: "9333444555",
    courseName: "Bread Mastery",
    approved: true,
    completed: true,
    completionDate: "15 May 2026",
    certificateId: "NIMU-2026-003"
  },
  {
    studentId: "STU-004",
    studentName: "Arjun Sharma",
    email: "arjun@gmail.com",
    phone: "9000000001",
    courseName: "Basic Baking Foundation",
    approved: true,
    completed: true,
    completionDate: "18 May 2026",
    certificateId: "NIMU-2026-004"
  },
  {
    studentId: "STU-005",
    studentName: "Muskan Naz",
    email: "muskan@nimu.com",
    phone: "9777240070",
    courseName: "Pastry & Viennoiserie",
    approved: true,
    completed: true,
    completionDate: "20 May 2026",
    certificateId: "NIMU-2026-005"
  }
];
