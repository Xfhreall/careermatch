-- Add description and supporting file columns to hrd_approval_requests
alter table public.hrd_approval_requests
add column if not exists description text,
add column if not exists supporting_file_path text,
add column if not exists supporting_file_name text;

-- Create storage bucket for HRD registration documents
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'hrd-documents',
  'hrd-documents',
  false,
  10485760,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Create policy to allow full access to service_role
drop policy if exists hrd_documents_service_role_all on storage.objects;
create policy hrd_documents_service_role_all
on storage.objects
for all
to service_role
using (bucket_id = 'hrd-documents')
with check (bucket_id = 'hrd-documents');
