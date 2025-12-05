import { useStaffAvailability } from '@/hooks/useStaffAvailability';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, User } from 'lucide-react';

const DAYS_OF_WEEK = [
  { value: 1, label: 'T2' },
  { value: 2, label: 'T3' },
  { value: 3, label: 'T4' },
  { value: 4, label: 'T5' },
  { value: 5, label: 'T6' },
  { value: 6, label: 'T7' },
  { value: 0, label: 'CN' },
];

const TIME_SLOTS = [
  { value: 'sáng' as const, label: 'Sáng' },
  { value: 'chiều' as const, label: 'Chiều' },
  { value: 'tối' as const, label: 'Tối' },
];

export function WeeklyAvailability() {
  const { staffAvailability, currentStaff, isLoading, toggleAvailability } = useStaffAvailability();

  const isAvailable = (staffId: string, dayOfWeek: number, timeSlot: 'sáng' | 'chiều' | 'tối') => {
    const staff = staffAvailability.find(s => s.id === staffId);
    return staff?.availability.some(a => a.day_of_week === dayOfWeek && a.time_slot === timeSlot) || false;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentStaff) {
    return (
      <div className="text-center py-8 space-y-2">
        <p className="text-muted-foreground">
          Tài khoản của bạn chưa được liên kết với nhân viên nào.
        </p>
        <p className="text-sm text-muted-foreground">
          Vui lòng liên hệ quản lý để được liên kết tài khoản.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current user info */}
      <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
        <div className="p-2 bg-primary rounded-full">
          <User className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <p className="font-medium text-foreground">{currentStaff.name}</p>
          <p className="text-sm text-muted-foreground">Đánh dấu các buổi bạn có thể đi làm</p>
        </div>
      </div>

      {/* Availability table for current user only */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 font-medium text-muted-foreground">Buổi</th>
              {DAYS_OF_WEEK.map(day => (
                <th key={day.value} className="p-3 text-center font-medium text-muted-foreground">
                  {day.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map(slot => (
              <tr key={slot.value} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                <td className="p-3 font-medium text-foreground">{slot.label}</td>
                {DAYS_OF_WEEK.map(day => (
                  <td key={`${day.value}-${slot.value}`} className="p-3 text-center">
                    <Checkbox
                      checked={isAvailable(currentStaff.id, day.value, slot.value)}
                      onCheckedChange={() => toggleAvailability(currentStaff.id, day.value, slot.value)}
                      className="mx-auto"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Other staff availability (read-only) */}
      {staffAvailability.filter(s => s.id !== currentStaff.id).length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold text-foreground mb-4">Lịch của các nhân viên khác</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground">Nhân viên</th>
                  {DAYS_OF_WEEK.map(day => (
                    <th key={day.value} className="p-2 text-center font-medium text-muted-foreground" colSpan={3}>
                      {day.label}
                    </th>
                  ))}
                </tr>
                <tr className="border-b border-border bg-muted/30">
                  <th></th>
                  {DAYS_OF_WEEK.map(day => (
                    TIME_SLOTS.map(slot => (
                      <th 
                        key={`${day.value}-${slot.value}`} 
                        className="p-1 text-center text-xs font-normal text-muted-foreground"
                      >
                        {slot.label}
                      </th>
                    ))
                  ))}
                </tr>
              </thead>
              <tbody>
                {staffAvailability
                  .filter(staff => staff.id !== currentStaff.id)
                  .map(staff => (
                    <tr key={staff.id} className="border-b border-border/50">
                      <td className="p-3 font-medium text-foreground">{staff.name}</td>
                      {DAYS_OF_WEEK.map(day => (
                        TIME_SLOTS.map(slot => (
                          <td key={`${staff.id}-${day.value}-${slot.value}`} className="p-1 text-center">
                            {isAvailable(staff.id, day.value, slot.value) ? (
                              <Badge variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center">
                                ✓
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground/30">-</span>
                            )}
                          </td>
                        ))
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
