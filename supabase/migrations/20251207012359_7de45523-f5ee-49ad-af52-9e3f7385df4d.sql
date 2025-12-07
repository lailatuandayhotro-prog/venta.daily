-- Create products table
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Everyone can view active products
CREATE POLICY "Authenticated users can view products" 
ON public.products 
FOR SELECT 
TO authenticated
USING (true);

-- Only admins can insert products
CREATE POLICY "Admins can insert products" 
ON public.products 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update products
CREATE POLICY "Admins can update products" 
ON public.products 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete products
CREATE POLICY "Admins can delete products" 
ON public.products 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default products
INSERT INTO public.products (name) VALUES 
  ('Nước hoa'),
  ('Quần áo'),
  ('Rong biển'),
  ('Mỹ phẩm'),
  ('Phụ kiện'),
  ('Thực phẩm'),
  ('Khác');