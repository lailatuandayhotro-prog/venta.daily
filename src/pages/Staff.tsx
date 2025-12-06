import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useStaff } from '@/hooks/useStaff';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Pencil, Trash2, Users, Loader2, Link, Unlink, ShieldAlert } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface StaffFormData {
  name: string;
  email: string;
  phone: string;
}

const Staff = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { role, isManager, isLoading: roleLoading } = useUserRole();
  const { staff, isLoading, addStaff, updateStaff, deleteStaff, linkUserToStaff, unlinkUserFromStaff } = useStaff();
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<StaffFormData>({ name: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  // Check if current user is already linked to a staff
  const currentUserStaff = staff.find(s => s.user_id === user?.id);

  // Redirect if not logged in
  if (!authLoading && !user) {
    navigate('/auth');
    return null;
  }

  // Check if user has permission (admin or manager)
  if (!authLoading && !roleLoading && !isManager) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Không có quyền truy cập</h2>
            <p className="text-muted-foreground">
              Chỉ Admin hoặc Quản lý mới có thể truy cập trang này.
            </p>
            <Button onClick={() => navigate('/')} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Về trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ variant: 'destructive', title: 'Lỗi', description: 'Vui lòng nhập tên nhân viên' });
      return;
    }

    setSubmitting(true);
    try {
      if (editId) {
        await updateStaff(editId, formData);
        toast({ title: 'Đã cập nhật thông tin nhân viên' });
      } else {
        await addStaff(formData);
        toast({ title: 'Đã thêm nhân viên mới' });
      }
      setFormOpen(false);
      setEditId(null);
      setFormData({ name: '', email: '', phone: '' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (s: typeof staff[0]) => {
    setEditId(s.id);
    setFormData({ name: s.name, email: s.email || '', phone: s.phone || '' });
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa nhân viên này?')) {
      await deleteStaff(id);
      toast({ title: 'Đã xóa nhân viên' });
    }
  };

  const handleToggleActive = async (s: typeof staff[0]) => {
    await updateStaff(s.id, { is_active: !s.is_active });
    toast({ title: s.is_active ? 'Đã vô hiệu hóa' : 'Đã kích hoạt' });
  };

  const handleLinkAccount = async (staffId: string) => {
    if (!user) return;
    
    // Check if user is already linked to another staff
    if (currentUserStaff && currentUserStaff.id !== staffId) {
      toast({ 
        variant: 'destructive', 
        title: 'Lỗi', 
        description: `Tài khoản của bạn đã được liên kết với nhân viên "${currentUserStaff.name}"` 
      });
      return;
    }

    const { error } = await linkUserToStaff(staffId, user.id);
    if (error) {
      toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể liên kết tài khoản' });
    } else {
      toast({ title: 'Đã liên kết tài khoản với nhân viên này' });
    }
  };

  const handleUnlinkAccount = async (staffId: string) => {
    const { error } = await unlinkUserFromStaff(staffId);
    if (error) {
      toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể hủy liên kết' });
    } else {
      toast({ title: 'Đã hủy liên kết tài khoản' });
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditId(null);
    setFormData({ name: '', email: '', phone: '' });
  };

  if (authLoading || isLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="p-2 gradient-primary rounded-xl shadow-glow">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Quản lý nhân viên</h1>
                <p className="text-sm text-muted-foreground">{staff.length} nhân viên</p>
              </div>
            </div>
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary text-primary-foreground font-semibold shadow-glow">
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm nhân viên
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editId ? 'Sửa thông tin' : 'Thêm nhân viên mới'}</DialogTitle>
                  <DialogDescription>
                    {editId ? 'Cập nhật thông tin nhân viên' : 'Nhập thông tin nhân viên mới'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Tên nhân viên *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nhập tên nhân viên"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Số điện thoại</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0123456789"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" className="flex-1" onClick={handleCloseForm}>
                      Hủy
                    </Button>
                    <Button 
                      className="flex-1 gradient-primary text-primary-foreground" 
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {editId ? 'Cập nhật' : 'Thêm'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Current user link status */}
      {currentUserStaff && (
        <div className="container py-4">
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 flex items-center gap-3">
            <Link className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium text-foreground">
                Tài khoản của bạn đã liên kết với: <span className="text-primary">{currentUserStaff.name}</span>
              </p>
              <p className="text-sm text-muted-foreground">Bạn có thể đăng ký lịch trống tại trang chủ</p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="container py-6">
        <Card className="border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Điện thoại</TableHead>
                  <TableHead className="text-center">Liên kết</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Chưa có nhân viên nào
                    </TableCell>
                  </TableRow>
                ) : (
                  staff.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="text-muted-foreground">{s.email || '-'}</TableCell>
                      <TableCell className="text-muted-foreground">{s.phone || '-'}</TableCell>
                      <TableCell className="text-center">
                        {s.user_id ? (
                          <div className="flex items-center justify-center gap-2">
                            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Đã liên kết
                            </Badge>
                            {s.user_id === user?.id && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleUnlinkAccount(s.id)}
                              >
                                <Unlink className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLinkAccount(s.id)}
                            disabled={!!currentUserStaff}
                          >
                            <Link className="h-4 w-4 mr-1" />
                            Liên kết
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={s.is_active}
                          onCheckedChange={() => handleToggleActive(s)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(s)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Staff;
