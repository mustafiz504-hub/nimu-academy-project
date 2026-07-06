import { create } from 'zustand';

export interface UploadTask {
  id: string;
  filename: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

interface UploadStore {
  tasks: UploadTask[];
  addTask: (task: UploadTask) => void;
  updateProgress: (id: string, progress: number) => void;
  completeTask: (id: string) => void;
  failTask: (id: string, error: string) => void;
  removeTask: (id: string) => void;
}

export const useUploadStore = create<UploadStore>((set) => ({
  tasks: [],
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateProgress: (id, progress) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, progress, status: 'uploading' } : t)
  })),
  completeTask: (id) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, progress: 100, status: 'completed' } : t)
  })),
  failTask: (id, error) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, status: 'error', error } : t)
  })),
  removeTask: (id) => set((state) => ({
    tasks: state.tasks.filter(t => t.id !== id)
  }))
}));
