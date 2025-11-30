import { useState, useEffect } from 'react';
import { WorkSession, SessionType, TimeSlot } from '@/types/session';

const STORAGE_KEY = 'work_sessions';

// Sample data matching the user's screenshot
const INITIAL_DATA: WorkSession[] = [
  { id: '1', date: '2025-11-17', timeSlot: 'chiều', staffNames: ['Trà My', 'An'], productCategory: 'Nước hoa', sessionType: 'livestream', createdAt: '2025-11-17T10:00:00' },
  { id: '2', date: '2025-11-18', timeSlot: 'chiều', staffNames: ['Chi', 'Ngân Hà'], productCategory: 'Quần áo', sessionType: 'livestream', createdAt: '2025-11-18T10:00:00' },
  { id: '3', date: '2025-11-18', timeSlot: 'tối', staffNames: ['An'], productCategory: 'Nước hoa', sessionType: 'livestream', createdAt: '2025-11-18T15:00:00' },
  { id: '4', date: '2025-11-19', timeSlot: 'chiều', staffNames: ['Ngân Hà'], productCategory: 'Quần áo', sessionType: 'livestream', createdAt: '2025-11-19T10:00:00' },
  { id: '5', date: '2025-11-19', timeSlot: 'tối', staffNames: ['An', 'Chi'], productCategory: 'Rong biển', sessionType: 'livestream', createdAt: '2025-11-19T15:00:00' },
  { id: '6', date: '2025-11-20', timeSlot: 'chiều', staffNames: ['An', 'Chi'], productCategory: 'Rong biển', sessionType: 'livestream', createdAt: '2025-11-20T10:00:00' },
  { id: '7', date: '2025-11-20', timeSlot: 'tối', staffNames: ['An', 'Chi'], productCategory: 'Rong biển', sessionType: 'livestream', createdAt: '2025-11-20T15:00:00' },
  { id: '8', date: '2025-11-22', timeSlot: 'chiều', staffNames: ['An', 'Chi'], productCategory: 'Rong biển', sessionType: 'livestream', notes: 'Bò xuyên tiêu', createdAt: '2025-11-22T10:00:00' },
  { id: '9', date: '2025-11-22', timeSlot: 'tối', staffNames: ['An', 'Chi'], productCategory: 'Rong biển', sessionType: 'livestream', createdAt: '2025-11-22T15:00:00' },
  { id: '10', date: '2025-11-23', timeSlot: 'tối', staffNames: ['An', 'Chi', 'Kỳ'], productCategory: 'Rong biển', sessionType: 'livestream', createdAt: '2025-11-23T15:00:00' },
];

export function useWorkSessions() {
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSessions(JSON.parse(stored));
    } else {
      setSessions(INITIAL_DATA);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
    }
    setIsLoading(false);
  }, []);

  const addSession = (session: Omit<WorkSession, 'id' | 'createdAt'>) => {
    const newSession: WorkSession = {
      ...session,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...sessions, newSession];
    setSessions(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newSession;
  };

  const updateSession = (id: string, updates: Partial<WorkSession>) => {
    const updated = sessions.map(s => s.id === id ? { ...s, ...updates } : s);
    setSessions(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const deleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return {
    sessions,
    isLoading,
    addSession,
    updateSession,
    deleteSession,
  };
}
