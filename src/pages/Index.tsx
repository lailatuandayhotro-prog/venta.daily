import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useWorkSessions, WorkSession } from '@/hooks/useWorkSessions';
import { SessionTable } from '@/components/SessionTable';
import { SessionForm } from '@/components/SessionForm';
import { FilterBar, FilterState } from '@/components/FilterBar';
import { StatsCards } from '@/components/StatsCards';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Radio, Users, LogOut, Loader2, Shield, ClipboardList } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { role, isLoading: roleLoading, getRoleLabel, isManager } = useUserRole();
  const { sessions, isLoading, addSession, updateSession, deleteSession } = useWorkSessions();
  const [formOpen, setFormOpen] = useState(false);
  const [editSession, setEditSession] = useState<WorkSession | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    staff: 'all',
    sessionType: 'all',
    dateFrom: '',
    dateTo: '',
  });

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          session.staff_names.some(n => n.toLowerCase().includes(searchLower)) ||
          session.product_category.toLowerCase().includes(searchLower) ||
          session.notes?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Staff filter
      if (filters.staff !== 'all' && !session.staff_names.includes(filters.staff)) {
        return false;
      }

      // Session type filter
      if (filters.sessionType !== 'all' && session.session_type !== filters.sessionType) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom && session.date < filters.dateFrom) {
        return false;
      }
      if (filters.dateTo && session.date > filters.dateTo) {
        return false;
      }

      return true;
    });
  }, [sessions, filters]);

  const handleSubmit = async (sessionData: {
    date: string;
    time_slot: 'sáng' | 'chiều' | 'tối';
    product_category: string;
    session_type: 'livestream' | 'video' | 'event';
    notes?: string;
    staff_ids: string[];
  }) => {
    if (editSession) {
      await updateSession(editSession.id, sessionData);
      toast({
        title: 'Đã cập nhật',
        description: 'Phiên đã được cập nhật thành công.',
      });
    } else {
      await addSession(sessionData);
      toast({
        title: 'Đã đăng ký',
        description: 'Phiên mới đã được đăng ký thành công.',
      });
    }
    setEditSession(null);
  };

  const handleEdit = (session: WorkSession) => {
    setEditSession(session);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteSession(id);
    toast({
      title: 'Đã xóa',
      description: 'Phiên đã được xóa thành công.',
    });
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) setEditSession(null);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 gradient-primary rounded-xl shadow-glow">
                <Radio className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Venta</h1>
                <p className="text-sm text-muted-foreground">Chấm công Livestream & Quay video</p>
              </div>
              {role && !roleLoading && (
                <Badge variant="secondary" className="ml-2">
                  <Shield className="h-3 w-3 mr-1" />
                  {getRoleLabel(role)}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                onClick={() => navigate('/staff')}
              >
                <Users className="h-4 w-4 mr-2" />
                Nhân viên
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/attendance')}
              >
                <ClipboardList className="h-4 w-4 mr-2" />
                Chấm công
              </Button>
              <Button 
                onClick={() => setFormOpen(true)}
                className="gradient-primary text-primary-foreground font-semibold shadow-glow hover:opacity-90 transition-opacity"
              >
                <Plus className="h-4 w-4 mr-2" />
                Phân công
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                title="Đăng xuất"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6 space-y-6">
        {/* Stats */}
        <StatsCards sessions={sessions} />

        {/* Filter & Table */}
        <div className="bg-card rounded-xl shadow-soft border border-border/50 overflow-hidden">
          <div className="p-4 border-b border-border">
            <FilterBar onFilterChange={setFilters} />
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <SessionTable 
              sessions={filteredSessions} 
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          )}
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground text-center">
          Hiển thị {filteredSessions.length} / {sessions.length} phiên
        </p>
      </main>

      {/* Form Dialog */}
      <SessionForm
        open={formOpen}
        onOpenChange={handleFormClose}
        onSubmit={handleSubmit}
        editSession={editSession}
      />
    </div>
  );
};

export default Index;
