create or replace function public.get_course_lesson_count(
  p_course_id uuid
)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::integer
  from public.course_lessons l
  join public.course_modules m
    on m.id = l.module_id
  join public.courses c
    on c.id = m.course_id
  where c.id = p_course_id
    and c.status = 'published'::public.course_status;
$$;

revoke all on function public.get_course_lesson_count(uuid) from public;

grant execute
on function public.get_course_lesson_count(uuid)
to authenticated;