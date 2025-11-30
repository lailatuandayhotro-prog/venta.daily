import { WorkSession } from '@/hooks/useWorkSessions';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const SESSION_TYPE_LABELS = {
  livestream: 'Livestream',
  video: 'Quay video',
  event: 'Sự kiện',
};

interface SessionTableProps {
  sessions: WorkSession[];
  onDelete: (id: string) => void;
  onEdit: (session: WorkSession) => void;
}

export function SessionTable({ sessions, onDelete, onEdit }: SessionTableProps) {
  const sortedSessions = [...sessions].sort((a, b) => {
    const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateCompare !== 0) return dateCompare;
    const timeOrder = { 'sáng': 0, 'chiều': 1, 'tối': 2 };
    return timeOrder[a.time_slot] - timeOrder[b.time_slot];
  });

  const formatDate = (dateStr: string, timeSlot: string) => {
    const date = parseISO(dateStr);
    const dayMonth = format(date, 'dd/MM', { locale: vi });
    return `${dayMonth} ${timeSlot}`;
  };

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-lg">Chưa có phiên nào được đăng ký</p>
        <p className="text-sm mt-1">Nhấn nút "Đăng ký phiên" để bắt đầu</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">Ngày</th>
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">Nhân viên</th>
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">Sản phẩm</th>
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">Loại</th>
            <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider"></th>
          </tr>
        </thead>
        <tbody>
          {sortedSessions.map((session, idx) => (
            <tr 
              key={session.id} 
              className="border-b border-border/50 hover:bg-muted/50 transition-colors animate-fade-in"
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              <td className="py-4 px-4">
                <span className="font-medium text-foreground">
                  {formatDate(session.date, session.time_slot)}
                </span>
              </td>
              <td className="py-4 px-4">
                <div className="flex flex-wrap gap-1">
                  {session.staff_names.map((name, i) => (
                    <Badge key={i} variant="secondary" className="font-medium">
                      {name}
                    </Badge>
                  ))}
                </div>
              </td>
              <td className="py-4 px-4">
                <span className="text-foreground">{session.product_category}</span>
                {session.notes && (
                  <span className="text-muted-foreground text-sm ml-2">({session.notes})</span>
                )}
              </td>
              <td className="py-4 px-4">
                <Badge 
                  variant="outline" 
                  className="border-primary/30 text-primary bg-primary/5"
                >
                  {SESSION_TYPE_LABELS[session.session_type]}
                </Badge>
              </td>
              <td className="py-4 px-4 text-right">
                <div className="flex justify-end gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => onEdit(session)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(session.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
