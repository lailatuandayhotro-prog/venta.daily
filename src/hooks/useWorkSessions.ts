import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WorkSession {
  id: string;
  date: string;
  time_slot: 'sáng' | 'chiều' | 'tối';
  product_category: string;
  session_type: 'livestream' | 'video' | 'event';
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  staff_names: string[];
  staff_ids: string[];
}

export function useWorkSessions() {
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSessions = async () => {
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('work_sessions')
      .select(`
        *,
        session_staff (
          staff:staff_id (
            id,
            name
          )
        )
      `)
      .order('date', { ascending: false });

    if (!sessionsError && sessionsData) {
      const mapped = sessionsData.map((s: any) => ({
        id: s.id,
        date: s.date,
        time_slot: s.time_slot,
        product_category: s.product_category,
        session_type: s.session_type,
        notes: s.notes,
        created_by: s.created_by,
        created_at: s.created_at,
        updated_at: s.updated_at,
        staff_names: s.session_staff?.map((ss: any) => ss.staff?.name).filter(Boolean) || [],
        staff_ids: s.session_staff?.map((ss: any) => ss.staff?.id).filter(Boolean) || [],
      }));
      setSessions(mapped);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const addSession = async (sessionData: {
    date: string;
    time_slot: 'sáng' | 'chiều' | 'tối';
    product_category: string;
    session_type: 'livestream' | 'video' | 'event';
    notes?: string;
    staff_ids: string[];
  }) => {
    const { staff_ids, ...sessionFields } = sessionData;
    
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data: newSession, error: sessionError } = await supabase
      .from('work_sessions')
      .insert([{ ...sessionFields, created_by: user?.id }])
      .select()
      .single();

    if (sessionError || !newSession) {
      return { error: sessionError };
    }

    if (staff_ids.length > 0) {
      const staffAssociations = staff_ids.map(staff_id => ({
        session_id: newSession.id,
        staff_id,
      }));
      
      await supabase
        .from('session_staff')
        .insert(staffAssociations);
    }

    await fetchSessions();
    return { data: newSession, error: null };
  };

  const updateSession = async (
    id: string,
    updates: {
      date?: string;
      time_slot?: 'sáng' | 'chiều' | 'tối';
      product_category?: string;
      session_type?: 'livestream' | 'video' | 'event';
      notes?: string;
      staff_ids?: string[];
    }
  ) => {
    const { staff_ids, ...sessionFields } = updates;

    if (Object.keys(sessionFields).length > 0) {
      await supabase
        .from('work_sessions')
        .update(sessionFields)
        .eq('id', id);
    }

    if (staff_ids !== undefined) {
      await supabase
        .from('session_staff')
        .delete()
        .eq('session_id', id);

      if (staff_ids.length > 0) {
        const staffAssociations = staff_ids.map(staff_id => ({
          session_id: id,
          staff_id,
        }));
        
        await supabase
          .from('session_staff')
          .insert(staffAssociations);
      }
    }

    await fetchSessions();
  };

  const deleteSession = async (id: string) => {
    await supabase
      .from('work_sessions')
      .delete()
      .eq('id', id);

    setSessions(prev => prev.filter(s => s.id !== id));
  };

  return {
    sessions,
    isLoading,
    addSession,
    updateSession,
    deleteSession,
    refetch: fetchSessions,
  };
}
