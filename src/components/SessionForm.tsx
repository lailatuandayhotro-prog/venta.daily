import { useState, useEffect } from 'react';
import { WorkSession, SessionType, TimeSlot, PRODUCT_CATEGORIES, DEFAULT_STAFF, SESSION_TYPE_LABELS, TIME_SLOT_LABELS } from '@/types/session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { format } from 'date-fns';

interface SessionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (session: Omit<WorkSession, 'id' | 'createdAt'>) => void;
  editSession?: WorkSession | null;
}

export function SessionForm({ open, onOpenChange, onSubmit, editSession }: SessionFormProps) {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('chiều');
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [productCategory, setProductCategory] = useState(PRODUCT_CATEGORIES[0]);
  const [sessionType, setSessionType] = useState<SessionType>('livestream');
  const [notes, setNotes] = useState('');
  const [customStaff, setCustomStaff] = useState('');

  useEffect(() => {
    if (editSession) {
      setDate(editSession.date);
      setTimeSlot(editSession.timeSlot);
      setSelectedStaff(editSession.staffNames);
      setProductCategory(editSession.productCategory);
      setSessionType(editSession.sessionType);
      setNotes(editSession.notes || '');
    } else {
      resetForm();
    }
  }, [editSession, open]);

  const resetForm = () => {
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setTimeSlot('chiều');
    setSelectedStaff([]);
    setProductCategory(PRODUCT_CATEGORIES[0]);
    setSessionType('livestream');
    setNotes('');
    setCustomStaff('');
  };

  const toggleStaff = (name: string) => {
    setSelectedStaff(prev => 
      prev.includes(name) 
        ? prev.filter(n => n !== name)
        : [...prev, name]
    );
  };

  const addCustomStaff = () => {
    if (customStaff.trim() && !selectedStaff.includes(customStaff.trim())) {
      setSelectedStaff(prev => [...prev, customStaff.trim()]);
      setCustomStaff('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStaff.length === 0) return;

    onSubmit({
      date,
      timeSlot,
      staffNames: selectedStaff,
      productCategory,
      sessionType,
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
            {editSession ? 'Chỉnh sửa phiên' : 'Đăng ký phiên mới'}
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
              {DEFAULT_STAFF.map((staff) => (
                <label
                  key={staff.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-all ${
                    selectedStaff.includes(staff.name)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background hover:bg-muted'
                  }`}
                >
                  <Checkbox
                    checked={selectedStaff.includes(staff.name)}
                    onCheckedChange={() => toggleStaff(staff.name)}
                    className="hidden"
                  />
                  <span className="font-medium text-sm">{staff.name}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Thêm nhân viên khác..."
                value={customStaff}
                onChange={(e) => setCustomStaff(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomStaff())}
                className="flex-1 bg-muted/50"
              />
              <Button type="button" variant="secondary" onClick={addCustomStaff}>
                Thêm
              </Button>
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
              disabled={selectedStaff.length === 0}
              className="gradient-primary text-primary-foreground font-semibold"
            >
              {editSession ? 'Cập nhật' : 'Đăng ký'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
