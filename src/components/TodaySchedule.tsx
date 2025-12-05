import { useMemo } from 'react';
import { useStaffAvailability } from '@/hooks/useStaffAvailability';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sun, Sunset, Moon } from 'lucide-react';

const TIME_SLOT_CONFIG = {
  'sáng': { label: 'Sáng', icon: Sun, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  'chiều': { label: 'Chiều', icon: Sunset, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  'tối': { label: 'Tối', icon: Moon, color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
};

export function TodaySchedule() {
  const { staffAvailability, isLoading } = useStaffAvailability();

  const todayDayOfWeek = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.

  const todayAvailableStaff = useMemo(() => {
    const result: { timeSlot: 'sáng' | 'chiều' | 'tối'; staffNames: string[] }[] = [];

    (['sáng', 'chiều', 'tối'] as const).forEach(timeSlot => {
      const staffNames = staffAvailability
        .filter(staff => 
          staff.availability.some(a => 
            a.day_of_week === todayDayOfWeek && a.time_slot === timeSlot
          )
        )
        .map(s => s.name);
      
      result.push({ timeSlot, staffNames });
    });

    return result;
  }, [staffAvailability, todayDayOfWeek]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const hasAnyStaff = todayAvailableStaff.some(t => t.staffNames.length > 0);

  if (!hasAnyStaff) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Không có nhân viên nào đăng ký lịch làm việc hôm nay.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {todayAvailableStaff.map(({ timeSlot, staffNames }) => {
        const config = TIME_SLOT_CONFIG[timeSlot];
        const Icon = config.icon;

        return (
          <div 
            key={timeSlot} 
            className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-border/50"
          >
            <div className={`p-2 rounded-lg ${config.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-foreground mb-2">{config.label}</h4>
              {staffNames.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {staffNames.map(name => (
                    <Badge key={name} variant="secondary">
                      {name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Chưa có ai đăng ký</span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {staffNames.length} người
            </div>
          </div>
        );
      })}
    </div>
  );
}
