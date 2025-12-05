import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useWorkSessions, WorkSession } from '@/hooks/useWorkSessions';
import { SessionTable } from '@/components/SessionTable';
import { SessionForm } from '@/components/SessionForm';
import { StatsCards } from '@/components/StatsCards';
import { TodaySchedule } from '@/components/TodaySchedule';
import { WeeklyAvailability } from '@/components/WeeklyAvailability';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Radio, Users, LogOut, Loader2, Shield, ClipboardList, Calendar, History, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format, parseISO, addDays, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { role, isLoading: roleLoading, getRoleLabel } = useUserRole();
  const { sessions, isLoading, addSession, updateSession, deleteSession } = useWorkSessions();
  const [formOpen, setFormOpen] = useState(false);
  const [editSession, setEditSession] = useState<WorkSession | null>(null);
  
  // Date selection: today by default
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [viewMode, setViewMode] = useState<'today' | 'history'>('today');

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Filter sessions by selected date
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => session.date === selectedDate);
  }, [sessions, selectedDate]);

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
        description: 'Task đã được cập nhật thành công.',
      });
    } else {
      await addSession(sessionData);
      toast({
        title: 'Đã phân công',
        description: 'Task mới đã được phân công thành công.',
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
      description: 'Task đã được xóa thành công.',
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

  const goToToday = () => {
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
    setViewMode('today');
  };

  const goToPrevDay = () => {
    const current = parseISO(selectedDate);
    setSelectedDate(format(subDays(current, 1), 'yyyy-MM-dd'));
    setViewMode('history');
  };

  const goToNextDay = () => {
    const current = parseISO(selectedDate);
    const nextDay = addDays(current, 1);
    const today = new Date();
    if (nextDay <= today) {
      setSelectedDate(format(nextDay, 'yyyy-MM-dd'));
    }
    if (format(nextDay, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      setViewMode('today');
    }
  };

  const isToday = selectedDate === format(new Date(), 'yyyy-MM-dd');

  const formatDisplayDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    return format(date, 'EEEE, dd/MM/yyyy', { locale: vi });
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
                <p className="text-sm text-muted-foreground">Phân công công việc</p>
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
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Công việc hôm nay
            </TabsTrigger>
            <TabsTrigger value="availability" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Lịch trống theo tuần
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Tasks */}
          <TabsContent value="tasks" className="space-y-6">
            {/* Today's Available Staff */}
            <div className="bg-card rounded-xl shadow-soft border border-border/50 overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Lịch làm việc của nhân viên hôm nay
                </h2>
              </div>
              <div className="p-4">
                <TodaySchedule />
              </div>
            </div>

            {/* Date Navigation */}
            <div className="bg-card rounded-xl shadow-soft border border-border/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={goToPrevDay}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2 min-w-[280px] justify-center">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium capitalize">{formatDisplayDate(selectedDate)}</span>
                    {isToday && (
                      <Badge variant="default" className="ml-2">Hôm nay</Badge>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={goToNextDay}
                    disabled={isToday}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  {!isToday && (
                    <Button variant="outline" size="sm" onClick={goToToday}>
                      <History className="h-4 w-4 mr-2" />
                      Về hôm nay
                    </Button>
                  )}
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setViewMode(e.target.value === format(new Date(), 'yyyy-MM-dd') ? 'today' : 'history');
                    }}
                    className="w-40"
                  />
                </div>
              </div>
            </div>

            {/* Stats for selected date */}
            <StatsCards sessions={filteredSessions} />

            {/* Task Table */}
            <div className="bg-card rounded-xl shadow-soft border border-border/50 overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold text-foreground">
                  Danh sách công việc {isToday ? 'hôm nay' : `ngày ${format(parseISO(selectedDate), 'dd/MM')}`}
                </h2>
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
              {filteredSessions.length} task được phân công
            </p>
          </TabsContent>

          {/* Tab 2: Weekly Availability */}
          <TabsContent value="availability" className="space-y-6">
            <div className="bg-card rounded-xl shadow-soft border border-border/50 overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Đăng ký lịch trống theo tuần
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Nhân viên có thể đánh dấu các buổi có thể đi làm trong tuần
                </p>
              </div>
              <div className="p-4">
                <WeeklyAvailability />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Form Dialog */}
      <SessionForm
        open={formOpen}
        onOpenChange={handleFormClose}
        onSubmit={handleSubmit}
        editSession={editSession}
        defaultDate={selectedDate}
      />
    </div>
  );
};

export default Index;
