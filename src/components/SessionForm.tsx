import { useState, useEffect } from 'react';
import { WorkSession } from '@/hooks/useWorkSessions';
import { useStaff } from '@/hooks/useStaff';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { format } from 'date-fns';

type TimeSlot = 'sáng' | 'chiều' | 'tối';
type SessionType = 'livestream' | 'video' | 'event';

const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
  'sáng': 'Sáng',
  'chiều': 'Chiều',
  'tối': 'Tối',
};

const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  livestream: 'Livestream',
  video: 'Quay video',
  event: 'Sự kiện',
};

const PRODUCT_CATEGORIES = [
  'Nước hoa',
  'Quần áo',
  'Rong biển',
  'Mỹ phẩm',
  'Phụ kiện',
  'Thực phẩm',
  'Khác',
];

interface SessionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (session: {
    date: string;
    time_slot: TimeSlot;
    product_category: string;
    session_type: SessionType;
    notes?: string;
    staff_ids: string[];
  }) => void;
  editSession?: WorkSession | null;
  defaultDate?: string;
}

export function SessionForm({ open, onOpenChange, onSubmit, editSession, defaultDate }: SessionFormProps) {
  const { activeStaff } = useStaff();
  const [date, setDate] = useState(defaultDate || format(new Date(), 'yyyy-MM-dd'));
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('chiều');
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [productCategory, setProductCategory] = useState(PRODUCT_CATEGORIES[0]);
  const [sessionType, setSessionType] = useState<SessionType>('livestream');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editSession) {
      setDate(editSession.date);
      setTimeSlot(editSession.time_slot);
      setSelectedStaffIds(editSession.staff_ids);
      setProductCategory(editSession.product_category);
      setSessionType(editSession.session_type);
      setNotes(editSession.notes || '');
    } else {
      resetForm();
    }
  }, [editSession, open]);

  useEffect(() => {
    if (!editSession && defaultDate) {
      setDate(defaultDate);
    }
  }, [defaultDate, editSession]);

  const resetForm = () => {
    setDate(defaultDate || format(new Date(), 'yyyy-MM-dd'));
    setTimeSlot('chiều');
    setSelectedStaffIds([]);
    setProductCategory(PRODUCT_CATEGORIES[0]);
    setSessionType('livestream');
    setNotes('');
  };

  const toggleStaff = (id: string) => {
    setSelectedStaffIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStaffIds.length === 0) return;

    onSubmit({
      date,
      time_slot: timeSlot,
      staff_ids: selectedStaffIds,
      product_category: productCategory,
      session_type: sessionType,
      notes: notes.trim() || undefined,
    });

    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editSession ? 'Chỉnh sửa task' : 'Phân công task mới'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Ngày</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeSlot">Buổi</Label>
              <Select value={timeSlot} onValueChange={(v) => setTimeSlot(v as TimeSlot)}>
                <SelectTrigger className="bg-muted/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIME_SLOT_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nhân viên</Label>
            <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
              {activeStaff.length === 0 ? (
                <p className="text-muted-foreground text-sm">Chưa có nhân viên. Vui lòng thêm nhân viên trước.</p>
              ) : (
                activeStaff.map((staff) => (
                  <label
                    key={staff.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-all ${
                      selectedStaffIds.includes(staff.id)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background hover:bg-muted'
                    }`}
                  >
                    <Checkbox
                      checked={selectedStaffIds.includes(staff.id)}
                      onCheckedChange={() => toggleStaff(staff.id)}
                      className="hidden"
                    />
                    <span className="font-medium text-sm">{staff.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Loại phiên</Label>
              <Select value={sessionType} onValueChange={(v) => setSessionType(v as SessionType)}>
                <SelectTrigger className="bg-muted/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SESSION_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sản phẩm</Label>
              <Select value={productCategory} onValueChange={setProductCategory}>
                <SelectTrigger className="bg-muted/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Thêm ghi chú..."
              className="bg-muted/50"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={selectedStaffIds.length === 0}
              className="gradient-primary text-primary-foreground font-semibold"
            >
              {editSession ? 'Cập nhật' : 'Phân công'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
