import { useStaffAvailability } from '@/hooks/useStaffAvailability';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

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
  const { staffAvailability, isLoading, toggleAvailability } = useStaffAvailability();

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

  if (staffAvailability.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Chưa có nhân viên nào. Vui lòng thêm nhân viên trước.
      </div>
    );
  }

  return (
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
          {staffAvailability.map(staff => (
            <tr key={staff.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
              <td className="p-3 font-medium text-foreground">{staff.name}</td>
              {DAYS_OF_WEEK.map(day => (
                TIME_SLOTS.map(slot => (
                  <td key={`${staff.id}-${day.value}-${slot.value}`} className="p-1 text-center">
                    <Checkbox
                      checked={isAvailable(staff.id, day.value, slot.value)}
                      onCheckedChange={() => toggleAvailability(staff.id, day.value, slot.value)}
                      className="mx-auto"
                    />
                  </td>
                ))
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
