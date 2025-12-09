import { useState, useEffect } from 'react';
import { WorkSession } from '@/hooks/useWorkSessions';
import { useStaff } from '@/hooks/useStaff';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';

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

interface TaskItem {
  id: string;
  session_type: SessionType;
  product_category: string;
  notes: string;
  duration_hours: string;
}

interface SessionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (session: {
    date: string;
    time_slot: TimeSlot;
    product_category: string;
    session_type: SessionType;
    notes?: string;
    duration_hours?: number;
    staff_ids: string[];
  }) => void;
  editSession?: WorkSession | null;
  defaultDate?: string;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export function SessionForm({ open, onOpenChange, onSubmit, editSession, defaultDate }: SessionFormProps) {
  const { activeStaff } = useStaff();
  const { activeProducts } = useProducts();
  const [date, setDate] = useState(defaultDate || format(new Date(), 'yyyy-MM-dd'));
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('chiều');
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  
  const getDefaultProduct = () => activeProducts.length > 0 ? activeProducts[0].name : '';
  
  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: generateId(), session_type: 'livestream', product_category: '', notes: '', duration_hours: '' }
  ]);

  useEffect(() => {
    if (editSession) {
      setDate(editSession.date);
      setTimeSlot(editSession.time_slot);
      setSelectedStaffIds(editSession.staff_ids);
      setTasks([{
        id: generateId(),
        session_type: editSession.session_type,
        product_category: editSession.product_category,
        notes: editSession.notes || '',
        duration_hours: editSession.duration_hours?.toString() || ''
      }]);
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
    setTasks([{ id: generateId(), session_type: 'livestream', product_category: getDefaultProduct(), notes: '', duration_hours: '' }]);
  };

  const toggleStaff = (id: string) => {
    setSelectedStaffIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const addTask = () => {
    setTasks(prev => [...prev, { 
      id: generateId(), 
      session_type: 'livestream', 
      product_category: getDefaultProduct(), 
      notes: '',
      duration_hours: ''
    }]);
  };

  const removeTask = (id: string) => {
    if (tasks.length > 1) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const updateTask = (id: string, field: keyof TaskItem, value: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStaffIds.length === 0) return;

    // Submit each task separately
    for (const task of tasks) {
      const durationValue = task.duration_hours ? parseFloat(task.duration_hours) : undefined;
      await onSubmit({
        date,
        time_slot: timeSlot,
        staff_ids: selectedStaffIds,
        product_category: task.product_category,
        session_type: task.session_type,
        notes: task.notes.trim() || undefined,
        duration_hours: task.session_type === 'livestream' ? durationValue : undefined,
      });
    }

    resetForm();
    onOpenChange(false);
  };

  const isEditMode = !!editSession;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold">
            {editSession ? 'Chỉnh sửa task' : 'Phân công task mới'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 py-2 sm:py-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="date" className="text-sm">Ngày</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-muted/50 h-10"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="timeSlot" className="text-sm">Buổi</Label>
              <Select value={timeSlot} onValueChange={(v) => setTimeSlot(v as TimeSlot)}>
                <SelectTrigger className="bg-muted/50 h-10">
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

          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-sm">Nhân viên</Label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 p-2.5 sm:p-3 bg-muted/50 rounded-lg max-h-32 overflow-y-auto">
              {activeStaff.length === 0 ? (
                <p className="text-muted-foreground text-xs sm:text-sm">Chưa có nhân viên. Vui lòng thêm nhân viên trước.</p>
              ) : (
                activeStaff.map((staff) => (
                  <label
                    key={staff.id}
                    className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md cursor-pointer transition-all text-xs sm:text-sm ${
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
                    <span className="font-medium">{staff.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Danh sách công việc</Label>
              {!isEditMode && (
                <Button type="button" variant="outline" size="sm" onClick={addTask} className="gap-1 h-8 text-xs sm:text-sm">
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Thêm task
                </Button>
              )}
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              {tasks.map((task, index) => (
                <div key={task.id} className="p-2.5 sm:p-3 bg-muted/30 rounded-lg border border-border/50 space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground">Task {index + 1}</span>
                    {tasks.length > 1 && !isEditMode && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeTask(task.id)}
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Loại phiên</Label>
                      <Select 
                        value={task.session_type} 
                        onValueChange={(v) => updateTask(task.id, 'session_type', v)}
                      >
                        <SelectTrigger className="bg-background h-9 text-xs sm:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(SESSION_TYPE_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Sản phẩm</Label>
                      <Select 
                        value={task.product_category} 
                        onValueChange={(v) => updateTask(task.id, 'product_category', v)}
                      >
                        <SelectTrigger className="bg-background h-9 text-xs sm:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {activeProducts.map((product) => (
                            <SelectItem key={product.id} value={product.name}>{product.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Duration field - only show for livestream */}
                  {task.session_type === 'livestream' && (
                    <div className="space-y-1">
                      <Label className="text-xs">Số giờ live</Label>
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        value={task.duration_hours}
                        onChange={(e) => updateTask(task.id, 'duration_hours', e.target.value)}
                        placeholder="VD: 2, 2.5, 3..."
                        className="bg-background h-9 text-sm"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Ghi chú</Label>
                    <Input
                      value={task.notes}
                      onChange={(e) => updateTask(task.id, 'notes', e.target.value)}
                      placeholder="VD: 19h-22h, số lượng 3..."
                      className="bg-background h-9 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2 flex-col-reverse sm:flex-row">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={selectedStaffIds.length === 0}
              className="gradient-primary text-primary-foreground font-semibold w-full sm:w-auto"
            >
              {editSession ? 'Cập nhật' : `Phân công ${tasks.length > 1 ? `(${tasks.length} tasks)` : ''}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}