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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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

          {/* Task List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Danh sách công việc</Label>
              {!isEditMode && (
                <Button type="button" variant="outline" size="sm" onClick={addTask} className="gap-1">
                  <Plus className="h-4 w-4" />
                  Thêm task
                </Button>
              )}
            </div>
            
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <div key={task.id} className="p-3 bg-muted/30 rounded-lg border border-border/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Task {index + 1}</span>
                    {tasks.length > 1 && !isEditMode && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeTask(task.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Loại phiên</Label>
                      <Select 
                        value={task.session_type} 
                        onValueChange={(v) => updateTask(task.id, 'session_type', v)}
                      >
                        <SelectTrigger className="bg-background">
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
                        <SelectTrigger className="bg-background">
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
                        className="bg-background"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Ghi chú</Label>
                    <Input
                      value={task.notes}
                      onChange={(e) => updateTask(task.id, 'notes', e.target.value)}
                      placeholder="VD: 19h-22h, số lượng 3..."
                      className="bg-background"
                    />
                  </div>
                </div>
              ))}
            </div>
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
              {editSession ? 'Cập nhật' : `Phân công ${tasks.length > 1 ? `(${tasks.length} tasks)` : ''}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}