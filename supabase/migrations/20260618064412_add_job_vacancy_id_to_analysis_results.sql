ALTER TABLE public.analysis_results
  ADD COLUMN IF NOT EXISTS job_vacancy_id uuid
  REFERENCES public.job_vacancies(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_analysis_results_job_vacancy
  ON public.analysis_results(job_vacancy_id);
