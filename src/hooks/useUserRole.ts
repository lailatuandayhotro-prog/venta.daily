import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'staff' | 'manager' | 'admin';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setIsLoading(false);
      return;
    }

    const fetchRole = async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data) {
        setRole(data.role as AppRole);
      } else {
        setRole('staff'); // Default role
      }
      setIsLoading(false);
    };

    fetchRole();
  }, [user]);

  const isAdmin = role === 'admin';
  const isManager = role === 'manager' || role === 'admin';
  const isStaff = role === 'staff';

  const getRoleLabel = (r: AppRole) => {
    switch (r) {
      case 'admin': return 'Admin';
      case 'manager': return 'Quản lý';
      case 'staff': return 'Nhân viên';
    }
  };

  return {
    role,
    isLoading,
    isAdmin,
    isManager,
    isStaff,
    getRoleLabel,
  };
}
