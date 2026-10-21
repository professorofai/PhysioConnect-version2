ALTER TABLE public.assessment_submissions ADD COLUMN report_paths text[] NOT NULL DEFAULT '{}';

CREATE POLICY "Patients can upload own reports" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'patient-reports' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Patients can read own reports" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'patient-reports' AND (storage.foldername(name))[1] = auth.uid()::text);