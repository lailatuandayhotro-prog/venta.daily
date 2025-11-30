import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StaffMember {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStaff = async () => {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .order('name');
    
    if (!error && data) {
      setStaff(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const addStaff = async (staffData: { name: string; email?: string; phone?: string }) => {
    const { data, error } = await supabase
      .from('staff')
      .insert([staffData])
      .select()
      .single();
    
    if (!error && data) {
      setStaff(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    }
    return { data, error };
  };

  const updateStaff = async (id: string, updates: Partial<StaffMember>) => {
    const { data, error } = await supabase
      .from('staff')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (!error && data) {
      setStaff(prev => prev.map(s => s.id === id ? data : s));
    }
    return { data, error };
  };

  const deleteStaff = async (id: string) => {
    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', id);
    
    if (!error) {
      setStaff(prev => prev.filter(s => s.id !== id));
    }
    return { error };
  };

  const activeStaff = staff.filter(s => s.is_active);

  return {
    staff,
    activeStaff,
    isLoading,
    addStaff,
    updateStaff,
    deleteStaff,
    refetch: fetchStaff,
  };
}
