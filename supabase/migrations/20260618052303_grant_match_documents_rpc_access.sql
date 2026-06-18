-- Allow authenticated users to read job_vacancies (needed for jobseeker vacancy picker)
GRANT SELECT ON public.job_vacancies TO authenticated;

-- Allow anon and authenticated to call match_documents RPC
GRANT EXECUTE ON FUNCTION public.match_documents(jsonb, int, extensions.vector) TO anon;
GRANT EXECUTE ON FUNCTION public.match_documents(jsonb, int, extensions.vector) TO authenticated;

-- RLS policy: jobseekers can read active vacancies
CREATE POLICY job_vacancies_authenticated_select
  ON public.job_vacancies
  FOR SELECT
  TO authenticated
  USING (metadata->>'status' = 'active');
