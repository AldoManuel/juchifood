-- Crear buckets para almacenamiento de imágenes
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('profile-images', 'profile-images', true),
  ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de seguridad para profile-images
CREATE POLICY "Public can view profile images" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-images');

CREATE POLICY "Users can upload profile images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'profile-images');

CREATE POLICY "Users can update their profile images" ON storage.objects
FOR UPDATE USING (bucket_id = 'profile-images');

CREATE POLICY "Users can delete their profile images" ON storage.objects
FOR DELETE USING (bucket_id = 'profile-images');

-- Políticas de seguridad para product-images
CREATE POLICY "Public can view product images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Users can upload product images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Users can update their product images" ON storage.objects
FOR UPDATE USING (bucket_id = 'product-images');

CREATE POLICY "Users can delete their product images" ON storage.objects
FOR DELETE USING (bucket_id = 'product-images');
