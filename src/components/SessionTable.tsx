import { WorkSession } from '@/hooks/useWorkSessions';
import { Trash2, Edit2, Tv, Video, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const SESSION_TYPE_CONFIG = {
  livestream: { label: 'Livestream', icon: Tv, color: 'text-red-500 bg-red-500/10' },
  video: { label: 'Quay video', icon: Video, color: 'text-blue-500 bg-blue-500/10' },
  event: { label: 'Sự kiện', icon: PartyPopper, color: 'text-yellow-500 bg-yellow-500/10' },
};

const TIME_SLOT_LABELS = {
  'sáng': 'Sáng',
  'chiều': 'Chiều',
  'tối': 'Tối',
};

interface SessionTableProps {
  sessions: WorkSession[];
  onDelete: (id: string) => void;
  onEdit: (session: WorkSession) => void;
}

interface FlattenedTask {
  sessionId: string;
  staffName: string;
  sessionType: 'livestream' | 'video' | 'event';
  productCategory: string;
  timeSlot: 'sáng' | 'chiều' | 'tối';
  notes: string | null;
  session: WorkSession;
}

export function SessionTable({ sessions, onDelete, onEdit }: SessionTableProps) {
  // Flatten sessions to show one row per employee-task
  const flattenedTasks: FlattenedTask[] = sessions.flatMap(session => 
    session.staff_names.map(staffName => ({
      sessionId: session.id,
      staffName,
      sessionType: session.session_type,
      productCategory: session.product_category,
      timeSlot: session.time_slot,
      notes: session.notes,
      session,
    }))
  );

  // Sort by staff name first, then by time slot
  const sortedTasks = flattenedTasks.sort((a, b) => {
    const nameCompare = a.staffName.localeCompare(b.staffName);
    if (nameCompare !== 0) return nameCompare;
    const timeOrder = { 'sáng': 0, 'chiều': 1, 'tối': 2 };
    return timeOrder[a.timeSlot] - timeOrder[b.timeSlot];
  });

  // Group tasks by staff name
  const groupedByStaff = sortedTasks.reduce((acc, task) => {
    if (!acc[task.staffName]) {
      acc[task.staffName] = [];
    }
    acc[task.staffName].push(task);
    return acc;
  }, {} as Record<string, FlattenedTask[]>);

  if (sortedTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-lg">Chưa có task nào được phân công</p>
        <p className="text-sm mt-1">Nhấn nút "Phân công" để bắt đầu</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">Nhân viên</th>
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">Nhiệm vụ</th>
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">Sản phẩm</th>
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">Ca</th>
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">Ghi chú</th>
            <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider"></th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedByStaff).map(([staffName, tasks], groupIdx) => (
            tasks.map((task, taskIdx) => {
              const typeConfig = SESSION_TYPE_CONFIG[task.sessionType];
              const TypeIcon = typeConfig.icon;
              const isFirstRow = taskIdx === 0;
              const isEvenGroup = groupIdx % 2 === 0;
              
              return (
                <tr 
                  key={`${task.sessionId}-${task.staffName}-${taskIdx}`}
                  className={`transition-colors animate-fade-in ${
                    isEvenGroup ? 'bg-background' : 'bg-muted/30'
                  } hover:bg-muted/50`}
                >
                  <td className={`py-4 px-4 ${isFirstRow ? 'border-t border-border/50' : ''}`}>
                    {isFirstRow ? (
                      <span className="font-semibold text-foreground">{staffName}</span>
                    ) : null}
                  </td>
                  <td className={`py-4 px-4 ${isFirstRow ? 'border-t border-border/50' : ''}`}>
                    <Badge variant="secondary" className={typeConfig.color}>
                      <TypeIcon className="h-3 w-3 mr-1" />
                      {typeConfig.label}
                    </Badge>
                  </td>
                  <td className={`py-4 px-4 ${isFirstRow ? 'border-t border-border/50' : ''}`}>
                    <span className="text-foreground">{task.productCategory}</span>
                  </td>
                  <td className={`py-4 px-4 ${isFirstRow ? 'border-t border-border/50' : ''}`}>
                    <Badge variant="outline">
                      {TIME_SLOT_LABELS[task.timeSlot]}
                    </Badge>
                  </td>
                  <td className={`py-4 px-4 ${isFirstRow ? 'border-t border-border/50' : ''}`}>
                    <span className="text-muted-foreground text-sm">
                      {task.notes || '-'}
                    </span>
                  </td>
                  <td className={`py-4 px-4 text-right ${isFirstRow ? 'border-t border-border/50' : ''}`}>
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => onEdit(task.session)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => onDelete(task.sessionId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })
          ))}
        </tbody>
      </table>
    </div>
  );
}
