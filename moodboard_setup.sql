-- 1. Create the Moodboard table
CREATE TABLE IF NOT EXISTS public.moodboard_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id integer NOT NULL,
  image_url text NOT NULL,
  scale_tier integer DEFAULT 1,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Enable Realtime on the table
-- (Supabase handles this automatically if you toggle it in UI, but this ensures it's published)
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.moodboard_images;

-- 3. Set Up Database Row Level Security (RLS)
ALTER TABLE public.moodboard_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view moodboard images" 
ON public.moodboard_images FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone authenticated can insert moodboard images" 
ON public.moodboard_images FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Anyone authenticated can update moodboard images" 
ON public.moodboard_images FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone authenticated can delete moodboard images" 
ON public.moodboard_images FOR DELETE 
USING (auth.role() = 'authenticated');

-- 4. Create the Storage Bucket for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('moodboard', 'moodboard', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Set Up Storage RLS
CREATE POLICY "Public moodboard read access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'moodboard' );

CREATE POLICY "Authenticated users can upload moodboard objects" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'moodboard' AND auth.role() = 'authenticated' );

CREATE POLICY "Authenticated users can update moodboard objects" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'moodboard' AND auth.role() = 'authenticated' );

CREATE POLICY "Authenticated users can delete moodboard objects" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'moodboard' AND auth.role() = 'authenticated' );
