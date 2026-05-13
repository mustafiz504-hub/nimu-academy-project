import axios from 'axios';
import { mockStudents } from '../data/students';
import { Student } from '../types/student';

const API_URL = import.meta.env.VITE_GOOGLE_SHEET_API_URL;

export type { Student };

// Local cache for recently added students to ensure instant search across pages
const getLocalStudents = (): Student[] => {
  const stored = localStorage.getItem('nimu_added_students');
  return stored ? JSON.parse(stored) : [];
};

const saveLocalStudent = (student: Student) => {
  const students = getLocalStudents();
  // Keep only last 50 added students locally to avoid bloat
  const updated = [student, ...students].slice(0, 50);
  localStorage.setItem('nimu_added_students', JSON.stringify(updated));
};

export const googleSheetsService = {
  async fetchStudents(): Promise<Student[]> {
    // 1. Get from cache for instant return
    const cached = getLocalStudents();
    
    if (!API_URL || API_URL.includes('your-script-url')) {
      return cached.length > 0 ? cached : mockStudents;
    }

    // 2. Return cached immediately if available (Optimistic)
    // The caller will receive this and can show it while the network call finishes.
    
    try {
      const response = await axios.get(API_URL);
      let apiStudents: Student[] = [];
      
      if (response.data && Array.isArray(response.data)) {
        apiStudents = response.data
          .filter((row: any) => row[0] && String(row[0]).trim() !== '')
          .map((row: any) => ({
            studentId: String(row[0] || ''),
            studentName: String(row[1] || ''),
            email: String(row[2] || ''),
            phone: String(row[3] || ''),
            courseName: String(row[4] || ''),
            approved: String(row[5]).toUpperCase() === 'TRUE' || row[5] === true,
            completed: String(row[6]).toUpperCase() === 'TRUE' || row[6] === true,
            certificateId: String(row[7] || ''),
            completionDate: String(row[8] || '')
          }));
        
        // Update full cache with fresh API data
        localStorage.setItem('nimu_added_students', JSON.stringify(apiStudents));
        return apiStudents;
      }
      
      return cached.length > 0 ? cached : mockStudents;
    } catch (error) {
      console.error('❌ Google Sheets API Error:', error);
      return cached.length > 0 ? cached : mockStudents;
    }
  },

  async addStudent(student: any) {
    // Save locally first for instant cross-page availability
    saveLocalStudent(student);

    if (!API_URL) return true; // Still return true so UI stays responsive

    try {
      const payload = JSON.stringify({
        action: 'addStudent',
        studentId: student.studentId || '',
        studentName: student.studentName || '',
        email: student.email || '',
        phone: student.phone || '',
        courseName: student.courseName || '',
        completionDate: student.completionDate || ''
      });

      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: payload
      });
      
      return true; 
    } catch (error) {
      console.error('Error adding student:', error);
      return false;
    }
  },

  async updateStudent(studentId: string, updates: Partial<Student>) {
    if (!API_URL) return false;

    try {
      const payload = JSON.stringify({
        action: 'updateStudent',
        studentId,
        updates
      });

      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: payload
      });
      
      return true;
    } catch (error) {
      console.error('Error updating student:', error);
      return false;
    }
  }
};
