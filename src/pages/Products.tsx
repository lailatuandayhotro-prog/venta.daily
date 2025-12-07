import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useProducts, Product } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Edit2, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function Products() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { role, isLoading: roleLoading } = useUserRole();
  const { products, isLoading, addProduct, updateProduct, deleteProduct } = useProducts();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!roleLoading && role !== 'admin') {
      toast.error('Bạn không có quyền truy cập trang này');
      navigate('/');
    }
  }, [role, roleLoading, navigate]);

  if (authLoading || roleLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  const handleAddProduct = async () => {
    if (!newProductName.trim()) {
      toast.error('Vui lòng nhập tên sản phẩm');
      return;
    }
    const success = await addProduct(newProductName.trim());
    if (success) {
      setNewProductName('');
      setAddDialogOpen(false);
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct || !editName.trim()) {
      toast.error('Vui lòng nhập tên sản phẩm');
      return;
    }
    const success = await updateProduct(editingProduct.id, { name: editName.trim() });
    if (success) {
      setEditingProduct(null);
      setEditName('');
      setEditDialogOpen(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!editingProduct) return;
    const success = await deleteProduct(editingProduct.id);
    if (success) {
      setEditingProduct(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleToggleActive = async (product: Product) => {
    await updateProduct(product.id, { is_active: !product.is_active });
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setEditingProduct(product);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
            </div>
          </div>
          <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm sản phẩm
          </Button>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách sản phẩm ({products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Chưa có sản phẩm nào
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên sản phẩm</TableHead>
                    <TableHead className="w-24 text-center">Hoạt động</TableHead>
                    <TableHead className="w-24 text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={product.is_active}
                          onCheckedChange={() => handleToggleActive(product)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditDialog(product)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => openDeleteDialog(product)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Add Product Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm sản phẩm mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Tên sản phẩm</Label>
                <Input
                  id="productName"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Nhập tên sản phẩm..."
                  onKeyDown={(e) => e.key === 'Enter' && handleAddProduct()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setAddDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleAddProduct}>Thêm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editProductName">Tên sản phẩm</Label>
                <Input
                  id="editProductName"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nhập tên sản phẩm..."
                  onKeyDown={(e) => e.key === 'Enter' && handleEditProduct()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setEditDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleEditProduct}>Lưu</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa</DialogTitle>
            </DialogHeader>
            <p className="py-4">
              Bạn có chắc chắn muốn xóa sản phẩm "{editingProduct?.name}"?
            </p>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
                Hủy
              </Button>
              <Button variant="destructive" onClick={handleDeleteProduct}>
                Xóa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
