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

  return (
    <div className="space-y-6">
      {/* Current user's availability section - only show if linked */}
      {currentStaff && (
        <>
          <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="p-1.5 sm:p-2 bg-primary rounded-full shrink-0">
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-foreground text-sm sm:text-base truncate">{currentStaff.name}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Đánh dấu các buổi bạn có thể đi làm</p>
            </div>
          </div>

          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full text-xs sm:text-sm min-w-[400px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2 sm:p-3 font-medium text-muted-foreground">Buổi</th>
                  {DAYS_OF_WEEK.map(day => (
                    <th key={day.value} className="p-2 sm:p-3 text-center font-medium text-muted-foreground">
                      {day.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map(slot => (
                  <tr key={slot.value} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="p-2 sm:p-3 font-medium text-foreground">{slot.label}</td>
                    {DAYS_OF_WEEK.map(day => (
                      <td key={`${day.value}-${slot.value}`} className="p-2 sm:p-3 text-center">
                        <Checkbox
                          checked={isAvailable(currentStaff.id, day.value, slot.value)}
                          onCheckedChange={() => toggleAvailability(currentStaff.id, day.value, slot.value)}
                          className="mx-auto h-4 w-4 sm:h-5 sm:w-5"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Not linked warning */}
      {!currentStaff && (
        <div className="p-4 bg-muted/50 rounded-lg border border-border text-center">
          <p className="text-muted-foreground">
            Tài khoản của bạn chưa được liên kết với nhân viên nào.
          </p>
          <p className="text-sm text-muted-foreground">
            Vui lòng liên hệ quản lý để được liên kết tài khoản và đánh dấu lịch của bạn.
          </p>
        </div>
      )}

      {/* All staff availability (read-only for others) */}
      {staffAvailability.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">
            {currentStaff ? 'Lịch của các nhân viên khác' : 'Lịch của tất cả nhân viên'}
          </h3>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full text-xs sm:text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2 sm:p-3 font-medium text-muted-foreground">Nhân viên</th>
                  {DAYS_OF_WEEK.map(day => (
                    <th key={day.value} className="p-1.5 sm:p-2 text-center font-medium text-muted-foreground" colSpan={3}>
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
                        className="p-0.5 sm:p-1 text-center text-[10px] sm:text-xs font-normal text-muted-foreground"
                      >
                        {slot.label.charAt(0)}
                      </th>
                    ))
                  ))}
                </tr>
              </thead>
              <tbody>
                {staffAvailability
                  .filter(staff => !currentStaff || staff.id !== currentStaff.id)
                  .map(staff => (
                    <tr key={staff.id} className="border-b border-border/50">
                      <td className="p-2 sm:p-3 font-medium text-foreground whitespace-nowrap">{staff.name}</td>
                      {DAYS_OF_WEEK.map(day => (
                        TIME_SLOTS.map(slot => (
                          <td key={`${staff.id}-${day.value}-${slot.value}`} className="p-0.5 sm:p-1 text-center">
                            {isAvailable(staff.id, day.value, slot.value) ? (
                              <Badge variant="secondary" className="w-5 h-5 sm:w-6 sm:h-6 p-0 flex items-center justify-center text-[10px] sm:text-xs">
                                ✓
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground/30 text-[10px] sm:text-xs">-</span>
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
