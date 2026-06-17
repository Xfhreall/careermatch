-- 1. Drop old functions with mismatched parameters
DROP FUNCTION IF EXISTS public.match_documents(vector, int, jsonb);
DROP FUNCTION IF EXISTS public.match_documents(jsonb, int, vector);
DROP FUNCTION IF EXISTS public.match_documents(extensions.vector, int, jsonb);
DROP FUNCTION IF EXISTS public.match_documents(jsonb, int, extensions.vector);

-- 2. Recreate function with UUID id type and correct parameter order for n8n
CREATE OR REPLACE FUNCTION public.match_documents (
  filter jsonb default '{}',
  match_count int default 10,
  query_embedding extensions.vector default null
) RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    job_vacancies.id,
    job_vacancies.content,
    job_vacancies.metadata,
    1 - (job_vacancies.embedding <=> query_embedding) AS similarity
  FROM public.job_vacancies
  WHERE job_vacancies.metadata @> filter
  ORDER BY job_vacancies.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
