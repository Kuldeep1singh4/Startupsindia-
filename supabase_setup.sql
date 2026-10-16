-- ==============================================================================
-- StartupsIndia Ambassador Platform — Complete Missing Tables & Bucket Setup
-- Target Project ID: ashopwqkfxurdmjcntlm
-- ==============================================================================

-- 1. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT DEFAULT 'announcement',
  target_audience TEXT DEFAULT 'all',
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Allow public read access to notifications'
  ) THEN
    CREATE POLICY "Allow public read access to notifications"
      ON public.notifications FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Allow admins to manage notifications'
  ) THEN
    CREATE POLICY "Allow admins to manage notifications"
      ON public.notifications FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.ambassadors
          WHERE ambassadors.user_id = auth.uid() AND ambassadors.role = 'admin'
        )
      );
  END IF;
END $$;

-- 2. REWARD CLAIMS TABLE
CREATE TABLE IF NOT EXISTS public.reward_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID REFERENCES public.ambassadors(id) ON DELETE CASCADE,
  reward_id TEXT NOT NULL,
  status TEXT DEFAULT 'Claim Requested',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.reward_claims ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reward_claims' AND policyname = 'Allow ambassadors to manage their claims'
  ) THEN
    CREATE POLICY "Allow ambassadors to manage their claims"
      ON public.reward_claims FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.ambassadors
          WHERE ambassadors.id = reward_claims.ambassador_id
            AND (ambassadors.user_id = auth.uid() OR ambassadors.role = 'admin')
        )
      );
  END IF;
END $$;

-- 3. PROOFS STORAGE BUCKET (For Task Proof Screenshots/Images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'proofs',
  'proofs',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];

-- Storage Policies for Proofs Bucket
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow public view of proofs'
  ) THEN
    CREATE POLICY "Allow public view of proofs"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'proofs');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to upload proofs'
  ) THEN
    CREATE POLICY "Allow authenticated users to upload proofs"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'proofs');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow users to delete their own proofs'
  ) THEN
    CREATE POLICY "Allow users to delete their own proofs"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'proofs' AND (auth.uid() = owner OR EXISTS (
        SELECT 1 FROM public.ambassadors WHERE ambassadors.user_id = auth.uid() AND ambassadors.role = 'admin'
      )));
  END IF;
END $$;
