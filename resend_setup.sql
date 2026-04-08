-- 1. Enable the pg_net extension (comes free with Supabase)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Create the function that will contact Resend directly
CREATE OR REPLACE FUNCTION public.send_resend_admin_email()
RETURNS trigger AS $$
BEGIN
  PERFORM net.http_post(
      url:='https://api.resend.com/emails',
      headers:=jsonb_build_object(
          'Content-Type','application/json',
          'Authorization', 'Bearer YOUR_RESEND_API_KEY_HERE'
      ),
      body:=jsonb_build_object(
          -- Note: You can only use onboarding@resend.dev if you are sending 
          -- to the email address registered on your Resend account, 
          -- or you must verify your own custom domain in Resend.
          'from', 'onboarding@resend.dev',
          'to', 'YOUR_PERSONAL_EMAIL@example.com',
          'subject', 'New User Pending Approval (Bicycle Dashboard)',
          'html', '<p>A new user profile was just created with the Database ID: <strong>' || NEW.id || '</strong></p><p>Please log into the Supabase Dashboard -> Table Editor -> profiles to approve them.</p>'
      )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger to fire the function when a new profile is made
DROP TRIGGER IF EXISTS trigger_send_resend_email ON public.profiles;
CREATE TRIGGER trigger_send_resend_email
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.send_resend_admin_email();
