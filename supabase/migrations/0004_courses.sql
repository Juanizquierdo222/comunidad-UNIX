-- Comunidad UNIX ITC / 0004_courses.sql
-- Version revisada para PRUEBAS LOCALES. PostgreSQL 15+.
-- Requiere 0001, 0002 y 0003. No modifica tablas de registro.
begin;

do $$
begin
  if to_regclass('public.profiles') is null
     or to_regprocedure('public.is_admin()') is null then
    raise exception 'Primero aplica las migraciones de registro';
  end if;
  if to_regclass('public.courses') is not null
     or to_regclass('public.creator_approvals') is not null then
    raise exception 'El modulo de cursos ya existe; no ejecutes 0004 dos veces';
  end if;
end $$;

create type public.course_status as enum
  ('draft', 'pending_review', 'published', 'rejected', 'archived');

create table public.creator_approvals (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  approved boolean not null default false,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint creator_approval_consistency check (
    (not approved and approved_by is null and approved_at is null)
    or (approved and approved_by is not null and approved_at is not null)
  )
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete restrict,
  title text not null check (char_length(btrim(title)) between 5 and 180),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text not null check (char_length(btrim(description)) between 20 and 5000),
  category text not null check (char_length(btrim(category)) between 2 and 80),
  level text not null check (level in ('principiante','intermedio','avanzado')),
  estimated_minutes integer check (estimated_minutes between 1 and 100000),
  status public.course_status not null default 'draft',
  review_note text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 2 and 180),
  description text,
  position integer not null check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, position)
);

create table public.course_lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.course_modules(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 2 and 180),
  content text not null default '',
  position integer not null check (position >= 0),
  estimated_minutes integer check (estimated_minutes between 1 and 10000),
  is_preview boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (module_id, position)
);

create table public.course_enrollments (
  course_id uuid not null references public.courses(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  primary key (course_id, student_id)
);

create index idx_courses_status on public.courses(status, published_at desc);
create index idx_courses_creator on public.courses(creator_id);
create index idx_modules_course on public.course_modules(course_id, position);
create index idx_lessons_module on public.course_lessons(module_id, position);
create index idx_enrollments_student on public.course_enrollments(student_id);

-- Helper privado: ningun cliente puede llamar a estas funciones via RPC.
create schema if not exists app_private;
revoke all on schema app_private from public, anon, authenticated;

create function app_private.can_create_courses()
returns boolean language sql stable security definer set search_path = '' as $$
  select public.is_admin() or exists (
    select 1 from public.profiles p
    join public.creator_approvals a on a.profile_id = p.id
    where p.id = (select auth.uid())
      and p.role in ('instructor','expositor')
      and p.onboarding_completed and a.approved
  );
$$;

create function app_private.can_edit_course(p_course_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.courses c
    where c.id = p_course_id and c.status in ('draft','rejected')
      and (public.is_admin() or
        (c.creator_id = (select auth.uid()) and app_private.can_create_courses()))
  );
$$;

create function app_private.can_read_course(p_course_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.courses c
    where c.id = p_course_id and (
      (c.status = 'published' and (select auth.uid()) is not null)
      or public.is_admin()
      or (c.creator_id = (select auth.uid()) and app_private.can_create_courses())
    )
  );
$$;

create function app_private.can_read_content(p_course_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.courses c
    where c.id = p_course_id and (
      public.is_admin()
      or (c.creator_id = (select auth.uid()) and app_private.can_create_courses())
      or (c.status = 'published' and exists (
        select 1 from public.course_enrollments e
        where e.course_id = c.id and e.student_id = (select auth.uid())
      ))
    )
  );
$$;

-- El cliente nunca puede asignarse el propietario ni cambiar el estado.
-- Las RPC de revision ejecutan como postgres y son las unicas que pueden
-- realizar transiciones. Un cliente autenticado no posee ese rol SQL.
create function app_private.guard_course()
returns trigger language plpgsql set search_path = '' as $$
declare
  privileged boolean := current_user = 'postgres';
begin
  if tg_op = 'INSERT' then
    if not app_private.can_create_courses() then
      raise exception 'Creador no autorizado';
    end if;
    new.creator_id := auth.uid();
    new.status := 'draft';
    new.review_note := null;
    new.reviewed_by := null;
    new.reviewed_at := null;
    new.published_at := null;
    return new;
  end if;

  if new.id is distinct from old.id
     or new.creator_id is distinct from old.creator_id
     or new.created_at is distinct from old.created_at then
    raise exception 'La identidad del curso es inmutable';
  end if;

  if privileged and new.status is distinct from old.status then
    -- Las transiciones solo pueden modificar estado y metadatos de revision.
    if (to_jsonb(new) - 'updated_at' - 'status' - 'review_note'
        - 'reviewed_by' - 'reviewed_at' - 'published_at')
       is distinct from
       (to_jsonb(old) - 'updated_at' - 'status' - 'review_note'
        - 'reviewed_by' - 'reviewed_at' - 'published_at') then
      raise exception 'No se puede editar el contenido durante una transicion';
    end if;
    return new;
  end if;

  if not app_private.can_edit_course(old.id) then
    raise exception 'El curso no esta disponible para edicion';
  end if;
  if new.status is distinct from old.status
     or new.review_note is distinct from old.review_note
     or new.reviewed_by is distinct from old.reviewed_by
     or new.reviewed_at is distinct from old.reviewed_at
     or new.published_at is distinct from old.published_at then
    raise exception 'Usa el flujo de revision para cambiar el estado';
  end if;
  return new;
end;
$$;

create trigger trg_guard_course before insert or update on public.courses
for each row execute function app_private.guard_course();

-- Evita mover contenido entre cursos y modificar temarios ya enviados.
create function app_private.guard_course_child()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  target_course uuid;
begin
  if tg_table_name = 'course_modules' then
    if tg_op = 'UPDATE' and new.course_id is distinct from old.course_id then
      raise exception 'No puedes mover un modulo entre cursos';
    end if;
    target_course := case when tg_op = 'DELETE' then old.course_id else new.course_id end;
  else
    if tg_op = 'UPDATE' and new.module_id is distinct from old.module_id then
      raise exception 'No puedes mover una leccion entre modulos';
    end if;
    select m.course_id into target_course from public.course_modules m
    where m.id = case when tg_op = 'DELETE' then old.module_id else new.module_id end;
  end if;
  if not coalesce(app_private.can_edit_course(target_course), false) then
    raise exception 'No autorizado para modificar este contenido';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  if tg_op = 'UPDATE' then
    new.id := old.id;
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$;

create trigger trg_guard_modules before insert or update or delete on public.course_modules
for each row execute function app_private.guard_course_child();
create trigger trg_guard_lessons before insert or update or delete on public.course_lessons
for each row execute function app_private.guard_course_child();

-- Las inscripciones pertenecen al usuario autenticado, no a un ID enviado.
create function app_private.guard_enrollment()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    new.student_id := auth.uid();
    if not exists (
      select 1 from public.profiles p
      where p.id = new.student_id and p.onboarding_completed
        and p.role in ('alumno','externo')
    ) or not exists (
      select 1 from public.courses c
      where c.id = new.course_id and c.status = 'published'
    ) then
      raise exception 'No puedes inscribirte en este curso';
    end if;
    new.enrolled_at := now();
  elsif tg_op = 'DELETE' then
    if old.student_id is distinct from auth.uid() then
      raise exception 'No puedes cancelar una inscripcion ajena';
    end if;
    return old;
  else
    raise exception 'Las inscripciones no se modifican directamente';
  end if;
  return new;
end;
$$;

create trigger trg_guard_enrollment before insert or update or delete on public.course_enrollments
for each row execute function app_private.guard_enrollment();

-- RPC administrativas: autorizacion comprobada en la base de datos.
create function public.set_creator_approval(p_profile_id uuid, p_approved boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'Solo un administrador puede aprobar creadores';
  end if;
  if p_approved is null then raise exception 'Decision obligatoria'; end if;
  if not exists (
    select 1 from public.profiles
    where id = p_profile_id and role in ('instructor','expositor')
      and onboarding_completed
  ) then
    raise exception 'El usuario no tiene un perfil de creador valido';
  end if;
  insert into public.creator_approvals(profile_id, approved, approved_by, approved_at)
  values (p_profile_id, p_approved,
    case when p_approved then auth.uid() else null end,
    case when p_approved then now() else null end)
  on conflict (profile_id) do update
  set approved = excluded.approved, approved_by = excluded.approved_by,
      approved_at = excluded.approved_at, updated_at = now();
end;
$$;

create function public.submit_course_review(p_course_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not app_private.can_edit_course(p_course_id) then
    raise exception 'No puedes enviar este curso a revision';
  end if;
  if not exists (
    select 1 from public.course_modules m
    join public.course_lessons l on l.module_id = m.id
    where m.course_id = p_course_id and char_length(btrim(l.content)) > 0
  ) then
    raise exception 'El curso necesita al menos una leccion con contenido';
  end if;
  update public.courses
  set status = 'pending_review', review_note = null,
      reviewed_by = null, reviewed_at = null, published_at = null
  where id = p_course_id and status in ('draft','rejected');
  if not found then raise exception 'No se pudo enviar el curso'; end if;
end;
$$;

create function public.review_course(
  p_course_id uuid, p_approved boolean, p_note text default null
)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'Solo un administrador puede revisar cursos';
  end if;
  if p_approved is null then raise exception 'Decision obligatoria'; end if;
  update public.courses
  set status = case when p_approved then 'published'::public.course_status
                    else 'rejected'::public.course_status end,
      review_note = nullif(btrim(p_note), ''),
      reviewed_by = auth.uid(), reviewed_at = now(),
      published_at = case when p_approved then now() else null end
  where id = p_course_id and status = 'pending_review';
  if not found then
    raise exception 'El curso no existe o no esta pendiente de revision';
  end if;
end;
$$;

-- RLS: acceso minimo a tablas y contenido.
alter table public.creator_approvals enable row level security;
alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.course_lessons enable row level security;
alter table public.course_enrollments enable row level security;

create policy approvals_read on public.creator_approvals for select to authenticated
using (profile_id = (select auth.uid()) or public.is_admin());

create policy courses_read on public.courses for select to authenticated
using (app_private.can_read_course(id));
create policy courses_insert on public.courses for insert to authenticated
with check (creator_id = (select auth.uid()) and app_private.can_create_courses() and status = 'draft');
create policy courses_update on public.courses for update to authenticated
using (app_private.can_edit_course(id))
with check (app_private.can_edit_course(id));

create policy modules_read on public.course_modules for select to authenticated
using (app_private.can_read_course(course_id));
create policy modules_insert on public.course_modules for insert to authenticated
with check (app_private.can_edit_course(course_id));
create policy modules_update on public.course_modules for update to authenticated
using (app_private.can_edit_course(course_id))
with check (app_private.can_edit_course(course_id));
create policy modules_delete on public.course_modules for delete to authenticated
using (app_private.can_edit_course(course_id));

create policy lessons_read on public.course_lessons for select to authenticated
using (exists (
  select 1 from public.course_modules m where m.id = module_id
    and (app_private.can_read_content(m.course_id)
         or (is_preview and app_private.can_read_course(m.course_id)))
));
create policy lessons_insert on public.course_lessons for insert to authenticated
with check (exists (
  select 1 from public.course_modules m where m.id = module_id
    and app_private.can_edit_course(m.course_id)
));
create policy lessons_update on public.course_lessons for update to authenticated
using (exists (
  select 1 from public.course_modules m where m.id = module_id
    and app_private.can_edit_course(m.course_id)
))
with check (exists (
  select 1 from public.course_modules m where m.id = module_id
    and app_private.can_edit_course(m.course_id)
));
create policy lessons_delete on public.course_lessons for delete to authenticated
using (exists (
  select 1 from public.course_modules m where m.id = module_id
    and app_private.can_edit_course(m.course_id)
));

create policy enrollments_read on public.course_enrollments for select to authenticated
using (student_id = (select auth.uid()) or public.is_admin()
  or exists (
    select 1 from public.courses c
    where c.id = course_id and c.creator_id = (select auth.uid())
      and app_private.can_create_courses()
  ));
create policy enrollments_insert on public.course_enrollments for insert to authenticated
with check (student_id = (select auth.uid())
  and exists (select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role in ('alumno','externo')
      and p.onboarding_completed)
  and exists (select 1 from public.courses c
    where c.id = course_id and c.status = 'published'));
create policy enrollments_delete on public.course_enrollments for delete to authenticated
using (student_id = (select auth.uid()));

-- Evitar permisos por defecto de PUBLIC en funciones SECURITY DEFINER.
revoke all on function public.set_creator_approval(uuid, boolean) from public, anon;
revoke all on function public.submit_course_review(uuid) from public, anon;
revoke all on function public.review_course(uuid, boolean, text) from public, anon;
grant execute on function public.set_creator_approval(uuid, boolean) to authenticated;
grant execute on function public.submit_course_review(uuid) to authenticated;
grant execute on function public.review_course(uuid, boolean, text) to authenticated;

revoke all on all functions in schema app_private from public, anon, authenticated;
grant usage on schema app_private to authenticated;
grant execute on function app_private.can_create_courses() to authenticated;
grant execute on function app_private.can_edit_course(uuid) to authenticated;
grant execute on function app_private.can_read_course(uuid) to authenticated;
grant execute on function app_private.can_read_content(uuid) to authenticated;

revoke all on public.creator_approvals from anon, authenticated;
grant select on public.creator_approvals to authenticated;
revoke all on public.courses, public.course_modules, public.course_lessons,
  public.course_enrollments from anon, authenticated;
grant select, insert, update on public.courses to authenticated;
grant select, insert, update, delete on public.course_modules, public.course_lessons to authenticated;
grant select, insert, delete on public.course_enrollments to authenticated;

create trigger trg_courses_updated_at before update on public.courses
for each row execute function public.set_updated_at();
create trigger trg_modules_updated_at before update on public.course_modules
for each row execute function public.set_updated_at();
create trigger trg_lessons_updated_at before update on public.course_lessons
for each row execute function public.set_updated_at();

commit;
