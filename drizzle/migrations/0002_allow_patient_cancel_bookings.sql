GRANT UPDATE, DELETE ON public.bookings TO authenticated;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bookings' AND policyname = 'Patients can update own bookings'
  ) THEN
    CREATE POLICY "Patients can update own bookings" ON public.bookings 
      FOR UPDATE TO authenticated 
      USING (auth.uid() = user_id) 
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bookings' AND policyname = 'Patients can delete own bookings'
  ) THEN
    CREATE POLICY "Patients can delete own bookings" ON public.bookings 
      FOR DELETE TO authenticated 
      USING (auth.uid() = user_id);
  END IF;
END $$;

