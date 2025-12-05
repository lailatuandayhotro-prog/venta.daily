import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface StaffAvailability {
  id: string;
  staff_id: string;
  day_of_week: number;
  time_slot: 'sáng' | 'chiều' | 'tối';
}

export interface StaffWithAvailability {
  id: string;
  name: string;
  user_id: string | null;
  availability: StaffAvailability[];
}

export function useStaffAvailability() {
  const { user } = useAuth();
  const [staffAvailability, setStaffAvailability] = useState<StaffWithAvailability[]>([]);
  const [currentStaff, setCurrentStaff] = useState<StaffWithAvailability | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAvailability = async () => {
    setIsLoading(true);
    
    // Get all staff
    const { data: staffData } = await supabase
      .from('staff')
      .select('id, name, user_id')
      .eq('is_active', true)
      .order('name');

    // Get all availability
    const { data: availabilityData } = await supabase
      .from('staff_availability')
      .select('*');

    if (staffData) {
      const mapped = staffData.map(staff => ({
        id: staff.id,
        name: staff.name,
        user_id: staff.user_id,
        availability: (availabilityData || [])
          .filter(a => a.staff_id === staff.id)
          .map(a => ({
            id: a.id,
            staff_id: a.staff_id,
            day_of_week: a.day_of_week,
            time_slot: a.time_slot as 'sáng' | 'chiều' | 'tối',
          })),
      }));
      setStaffAvailability(mapped);
      
      // Find current user's staff record
      if (user) {
        const myStaff = mapped.find(s => s.user_id === user.id);
        setCurrentStaff(myStaff || null);
      }
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAvailability();
  }, [user]);

  const toggleAvailability = async (staffId: string, dayOfWeek: number, timeSlot: 'sáng' | 'chiều' | 'tối') => {
    // Only allow toggling own availability
    if (!currentStaff || currentStaff.id !== staffId) {
      return;
    }

    // Check if availability exists
    const existing = currentStaff.availability.find(
      a => a.day_of_week === dayOfWeek && a.time_slot === timeSlot
    );

    if (existing) {
      // Remove
      await supabase
        .from('staff_availability')
        .delete()
        .eq('id', existing.id);
    } else {
      // Add
      await supabase
        .from('staff_availability')
        .insert({
          staff_id: staffId,
          day_of_week: dayOfWeek,
          time_slot: timeSlot,
        });
    }

    await fetchAvailability();
  };

  return {
    staffAvailability,
    currentStaff,
    isLoading,
    toggleAvailability,
    refetch: fetchAvailability,
  };
}
