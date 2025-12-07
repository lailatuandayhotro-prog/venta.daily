import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Product {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeProducts, setActiveProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      setProducts(data || []);
      setActiveProducts((data || []).filter(p => p.is_active));
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async (name: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .insert({ name });

      if (error) {
        if (error.code === '23505') {
          toast.error('Sản phẩm đã tồn tại');
          return false;
        }
        throw error;
      }

      toast.success('Đã thêm sản phẩm');
      await fetchProducts();
      return true;
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast.error('Không thể thêm sản phẩm');
      return false;
    }
  };

  const updateProduct = async (id: string, updates: { name?: string; is_active?: boolean }) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id);

      if (error) {
        if (error.code === '23505') {
          toast.error('Tên sản phẩm đã tồn tại');
          return false;
        }
        throw error;
      }

      toast.success('Đã cập nhật sản phẩm');
      await fetchProducts();
      return true;
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error('Không thể cập nhật sản phẩm');
      return false;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Đã xóa sản phẩm');
      await fetchProducts();
      return true;
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error('Không thể xóa sản phẩm');
      return false;
    }
  };

  return {
    products,
    activeProducts,
    isLoading,
    addProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts,
  };
}
