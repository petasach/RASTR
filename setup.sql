-- 1. Create the `profiles` table
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_approved boolean DEFAULT false,
  PRIMARY KEY (id)
);

-- 2. Enable Row Level Security (RLS) on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create Policy: Users can read their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING ( auth.uid() = id );

-- 4. Create Policy: Only admins (or nobody from the frontend directly) can update it
-- Here we allow no direct updates from the frontend to ensure security.
CREATE POLICY "Users cannot update profiles" 
ON public.profiles FOR UPDATE 
USING ( false );

-- 5. Create a function to handle new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert a new profile when a user signs up.
  -- is_approved will default to false.
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger the function every time a user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- --- --- --- --- --- --- --- ---
-- NOTE: For the EMAIL NOTIFICATION TO ADMIN (Option A):
-- --- --- --- --- --- --- --- ---
-- If you want an email sent to you when a user registers:
-- 1. Go to https://make.com or https://zapier.com or https://formspree.io and create a "Catch Webhook".
-- 2. In Supabase Dashboard: Go to "Integrations" -> "Webhooks" (or Database -> Webhooks).
-- 3. Create a new Webhook:
--    - Name: "Notify Admin on Signup"
--    - Table: `profiles`
--    - Events: Insert
--    - Type: HTTP Request
--    - Method: POST
--    - URL: <Paste your Zapier/Make/Formspree Webhook URL here>
-- 4. Your webhook provider will now receive the event, and you can map it to send you an email alert!
