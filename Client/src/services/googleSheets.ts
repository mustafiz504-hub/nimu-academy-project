import axios from 'axios';
import { mockStudents } from '../data/students';
import { Student } from '../types/student';

const API_URL = import.meta.env.VITE_GOOGLE_SHEET_API_URL;

export type { Student };

export const googleSheetsService = {
  async fetchStudents(): Promise<Student[]> {
    if (!API_URL || API_URL.includes('your-script-url')) {
      console.warn('⚠️ Google Sheets URL not set. Using Mock Data.');
      return mockStudents;
    }

    try {
      const response = await axios.get(API_URL);
      if (response.data && Array.isArray(response.data)) {
        // Filter out empty rows where studentId or studentName is missing
        return response.data
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
      }
      return mockStudents;
    } catch (error) {
      console.error('❌ Google Sheets API Error:', error);
      return mockStudents;
    }
  },

  async addStudent(student: any) {
    if (!API_URL) return false;

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
