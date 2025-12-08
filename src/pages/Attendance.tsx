import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useWorkSessions } from '@/hooks/useWorkSessions';
import { useStaff } from '@/hooks/useStaff';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Radio, 
  ArrowLeft, 
  Loader2, 
  Shield, 
  Calendar,
  Video,
  Tv,
  PartyPopper,
  ClipboardList
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import { vi } from 'date-fns/locale';

const SESSION_TYPE_ICONS = {
  livestream: Tv,
  video: Video,
  event: PartyPopper,
};

const Attendance = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { role, isLoading: roleLoading, getRoleLabel } = useUserRole();
  const { sessions, isLoading: sessionsLoading } = useWorkSessions();
  const { staff, isLoading: staffLoading } = useStaff();
  
  const [dateFrom, setDateFrom] = useState(() => format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(() => format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const attendanceData = useMemo(() => {
    const fromDate = parseISO(dateFrom);
    const toDate = parseISO(dateTo);

    return staff.map(member => {
      const memberSessions = sessions.filter(session => {
        const sessionDate = parseISO(session.date);
        const inDateRange = isWithinInterval(sessionDate, { start: fromDate, end: toDate });
        const isAssigned = session.staff_ids.includes(member.id);
        return inDateRange && isAssigned;
      });

      const livestreamSessions = memberSessions.filter(s => s.session_type === 'livestream');
      const livestreamHours = livestreamSessions.reduce((sum, s) => sum + (s.duration_hours || 0), 0);
      const videoCount = memberSessions.filter(s => s.session_type === 'video').length;
      const eventCount = memberSessions.filter(s => s.session_type === 'event').length;
      const totalTasks = memberSessions.length;

      // Count unique work days
      const workDays = new Set(memberSessions.map(s => s.date)).size;

      return {
        id: member.id,
        name: member.name,
        isActive: member.is_active,
        livestreamHours,
        videoCount,
        eventCount,
        totalTasks,
        workDays,
      };
    }).sort((a, b) => b.totalTasks - a.totalTasks);
  }, [staff, sessions, dateFrom, dateTo]);

  const totals = useMemo(() => {
    return attendanceData.reduce((acc, curr) => ({
      livestreamHours: acc.livestreamHours + curr.livestreamHours,
      video: acc.video + curr.videoCount,
      event: acc.event + curr.eventCount,
      total: acc.total + curr.totalTasks,
    }), { livestreamHours: 0, video: 0, event: 0, total: 0 });
  }, [attendanceData]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isLoading = sessionsLoading || staffLoading;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="p-2 gradient-primary rounded-xl shadow-glow">
                <Radio className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Chấm công</h1>
                <p className="text-sm text-muted-foreground">Thống kê công việc theo nhân viên</p>
              </div>
              {role && !roleLoading && (
                <Badge variant="secondary" className="ml-2">
                  <Shield className="h-3 w-3 mr-1" />
                  {getRoleLabel(role)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6 space-y-6">
        {/* Date Range Filter */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Khoảng thời gian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="space-y-1">
                <Label htmlFor="dateFrom" className="text-sm">Từ ngày</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dateTo" className="text-sm">Đến ngày</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-40"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <ClipboardList className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totals.total}</p>
                  <p className="text-xs text-muted-foreground">Tổng task</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <Tv className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totals.livestreamHours}h</p>
                  <p className="text-xs text-muted-foreground">Giờ Live</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Video className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totals.video}</p>
                  <p className="text-xs text-muted-foreground">Quay video</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <PartyPopper className="h-4 w-4 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totals.event}</p>
                  <p className="text-xs text-muted-foreground">Sự kiện</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Bảng chấm công</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : attendanceData.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                Chưa có dữ liệu nhân viên
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nhân viên</TableHead>
                    <TableHead className="text-center">Ngày công</TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Tv className="h-4 w-4 text-red-500" />
                        Giờ Live
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Video className="h-4 w-4 text-blue-500" />
                        Video
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <PartyPopper className="h-4 w-4 text-yellow-500" />
                        Sự kiện
                      </div>
                    </TableHead>
                    <TableHead className="text-center">Tổng task</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{row.name}</span>
                          {!row.isActive && (
                            <Badge variant="outline" className="text-xs">
                              Nghỉ việc
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {row.workDays}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.livestreamHours > 0 ? (
                          <Badge variant="secondary" className="bg-red-500/10 text-red-600">
                            {row.livestreamHours}h
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.videoCount > 0 ? (
                          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
                            {row.videoCount}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.eventCount > 0 ? (
                          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">
                            {row.eventCount}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="default">{row.totalTasks}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Attendance;
