-- =====================================================================
-- MIGRACIÓN 0001: ESQUEMA INICIAL
-- Sistema de registro multi-rol: Alumno, Instructor, Externo, Expositor
-- =====================================================================
-- Decisiones de diseño (documentadas por requisito de la sección 4/6):
--
-- 1. Se usa una tabla central `profiles` (1:1 con auth.users) que guarda
--    los datos comunes a todo usuario (nombre, rol, timestamps) y una
--    tabla específica por rol (alumno_profiles, instructor_profiles,
--    externo_profiles, expositor_profiles) que guarda únicamente los
--    campos propios de ese rol. Esto evita columnas nulas masivas
--    (anti-patrón "una tabla con 40 columnas opcionales") y permite
--    agregar nuevos roles en el futuro sin alterar las tablas existentes.
--
-- 2. El identificador interno de TODAS las tablas es un UUID (coincide
--    con auth.users.id vía FK), nunca expuesto como "adivinable".
--    El "código corto" visible al usuario (ej. UX-123456, visto en el
--    boceto) se genera automáticamente en servidor mediante trigger,
--    es único, y se usa como identificador PÚBLICO para roles externos
--    al instituto (Externo, Expositor), donde no existe un número de
--    control institucional. Alumnos e Instructores usan su número de
--    control real, por lo que no requieren código corto.
--
-- 3. La "procedencia / institución" se modela con un ENUM cerrado
--    (institution_type) + un campcampo de texto libre
--    (institution_other_name) que solo se permite (constraint) cuando
--    el enum vale 'OTRA'. Esta regla se refuerza en:
--      a) Frontend (ocultar/mostrar campo)
--      b) Zod (validación de request)
--      c) CHECK constraint en PostgreSQL (última línea de defensa)
--
-- 4. RLS: denegar por defecto. Cada usuario solo puede leer/escribir su
--    propio perfil. El rol 'admin' (guardado en profiles.role) puede leer
--    todo mediante políticas explícitas basadas en una función SECURITY
--    DEFINER que evita recursión infinita de RLS sobre la propia tabla.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------
create type public.user_role as enum ('alumno', 'instructor', 'externo', 'expositor', 'admin');

create type public.institution_type as enum (
  'UT',
  'UNICARIBE',
  'POLITECNICO',
  'OTRA',
  'SIN_INSTITUCION'
);

create type public.academic_degree as enum (
  'MTRO',
  'DR',
  'ING',
  'LIC',
  'OTRO'
);

-- ---------------------------------------------------------------------
-- FUNCIÓN AUXILIAR: updated_at automático
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- FUNCIÓN AUXILIAR: generador de código corto único (ej. EX-4F82A1)
-- No depende del cliente, se ejecuta en servidor (trigger), reintenta
-- ante colisión y usa un alfabeto sin caracteres ambiguos (0/O, 1/I).
-- ---------------------------------------------------------------------
create or replace function public.generate_public_code(prefix text, target_table regclass, target_column text)
returns text
language plpgsql
as $$
declare
  alphabet text := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  candidate text;
  exists_already boolean;
  attempt int := 0;
begin
  loop
    candidate := prefix || '-';
    for i in 1..6 loop
      candidate := candidate || substr(alphabet, (floor(random() * length(alphabet)) + 1)::int, 1);
    end loop;

    execute format('select exists(select 1 from %s where %I = $1)', target_table, target_column)
      into exists_already
      using candidate;

    exit when not exists_already;

    attempt := attempt + 1;
    if attempt > 20 then
      raise exception 'No fue posible generar un código único tras % intentos', attempt;
    end if;
  end loop;

  return candidate;
end;
$$;

-- ---------------------------------------------------------------------
-- TABLA: profiles (núcleo, 1:1 con auth.users)
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null,
  full_name text not null check (char_length(trim(full_name)) between 2 and 150),
  phone text check (phone is null or char_length(phone) between 7 and 20),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Datos comunes a todo usuario autenticado. 1:1 con auth.users.';

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create index idx_profiles_role on public.profiles(role);

-- ---------------------------------------------------------------------
-- TABLA: alumno_profiles
-- ---------------------------------------------------------------------
create table public.alumno_profiles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  control_number text not null,
  institution_type public.institution_type not null,
  institution_other_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint chk_alumno_control_number_format check (char_length(trim(control_number)) between 3 and 30),
  constraint chk_alumno_other_institution_requires_name check (
    (institution_type = 'OTRA' and institution_other_name is not null and char_length(trim(institution_other_name)) >= 2)
    or (institution_type <> 'OTRA' and institution_other_name is null)
  )
);

comment on table public.alumno_profiles is 'Datos específicos de usuarios con rol Alumno del instituto.';

create unique index uq_alumno_control_number on public.alumno_profiles (lower(control_number));

create trigger trg_alumno_updated_at
  before update on public.alumno_profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- TABLA: instructor_profiles
-- ---------------------------------------------------------------------
create table public.instructor_profiles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  control_number text,
  department text not null check (char_length(trim(department)) between 2 and 150),
  specialty text not null check (char_length(trim(specialty)) between 2 and 150),
  academic_degree public.academic_degree not null,
  academic_degree_other text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint chk_instructor_other_degree_requires_name check (
    (academic_degree = 'OTRO' and academic_degree_other is not null and char_length(trim(academic_degree_other)) >= 2)
    or (academic_degree <> 'OTRO' and academic_degree_other is null)
  )
);

comment on table public.instructor_profiles is 'Datos específicos de usuarios con rol Instructor/Maestro.';

create unique index uq_instructor_control_number on public.instructor_profiles (lower(control_number)) where control_number is not null;

create trigger trg_instructor_updated_at
  before update on public.instructor_profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- TABLA: externo_profiles (usa código público corto, sin control_number)
-- ---------------------------------------------------------------------
create table public.externo_profiles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  public_code text not null unique,
  institution_type public.institution_type not null,
  institution_other_name text,
  organization text not null check (char_length(trim(organization)) between 2 and 150),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint chk_externo_other_institution_requires_name check (
    (institution_type = 'OTRA' and institution_other_name is not null and char_length(trim(institution_other_name)) >= 2)
    or (institution_type <> 'OTRA' and institution_other_name is null)
  )
);

comment on table public.externo_profiles is 'Datos específicos de usuarios Externos. Código público autogenerado (no editable por el cliente).';

create trigger trg_externo_updated_at
  before update on public.externo_profiles
  for each row execute function public.set_updated_at();

create or replace function public.trg_set_externo_public_code()
returns trigger
language plpgsql
as $$
begin
  if new.public_code is null or char_length(trim(new.public_code)) = 0 then
    new.public_code := public.generate_public_code('EX', 'public.externo_profiles', 'public_code');
  end if;
  return new;
end;
$$;

create trigger trg_externo_public_code
  before insert on public.externo_profiles
  for each row execute function public.trg_set_externo_public_code();

-- ---------------------------------------------------------------------
-- TABLA: expositor_profiles
-- ---------------------------------------------------------------------
create table public.expositor_profiles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  public_code text not null unique,
  bio text not null check (char_length(trim(bio)) between 10 and 2000),
  institution_type public.institution_type not null,
  institution_other_name text,
  organization text check (organization is null or char_length(trim(organization)) between 2 and 150),
  profile_link text check (profile_link is null or profile_link ~* '^https?://'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint chk_expositor_other_institution_requires_name check (
    (institution_type = 'OTRA' and institution_other_name is not null and char_length(trim(institution_other_name)) >= 2)
    or (institution_type <> 'OTRA' and institution_other_name is null)
  )
);

comment on table public.expositor_profiles is 'Datos específicos de usuarios Expositores (ponentes invitados).';

create trigger trg_expositor_updated_at
  before update on public.expositor_profiles
  for each row execute function public.set_updated_at();

create or replace function public.trg_set_expositor_public_code()
returns trigger
language plpgsql
as $$
begin
  if new.public_code is null or char_length(trim(new.public_code)) = 0 then
    new.public_code := public.generate_public_code('XP', 'public.expositor_profiles', 'public_code');
  end if;
  return new;
end;
$$;

create trigger trg_expositor_public_code
  before insert on public.expositor_profiles
  for each row execute function public.trg_set_expositor_public_code();

-- ---------------------------------------------------------------------
-- FUNCIÓN AUXILIAR: completar onboarding de forma atómica
-- La creación de la fila específica de rol y el marcado de
-- `onboarding_completed` ocurren dentro de la MISMA sentencia/ transacción
-- de PostgreSQL. Si algo falla, no queda un perfil parcialmente completado.
-- ---------------------------------------------------------------------
create or replace function public.mark_profile_onboarded()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set onboarding_completed = true
  where id = new.profile_id;

  if not found then
    raise exception 'No existe el perfil base asociado al usuario';
  end if;

  return new;
end;
$$;

create trigger trg_alumno_mark_onboarded
  after insert on public.alumno_profiles
  for each row execute function public.mark_profile_onboarded();

create trigger trg_instructor_mark_onboarded
  after insert on public.instructor_profiles
  for each row execute function public.mark_profile_onboarded();

create trigger trg_externo_mark_onboarded
  after insert on public.externo_profiles
  for each row execute function public.mark_profile_onboarded();

create trigger trg_expositor_mark_onboarded
  after insert on public.expositor_profiles
  for each row execute function public.mark_profile_onboarded();

-- ---------------------------------------------------------------------
-- FUNCIÓN: crear automáticamente la fila `profiles` cuando se registra
-- un usuario en auth.users (Supabase Auth). El rol y nombre llegan en
-- raw_user_meta_data desde el signUp() del cliente, pero la fila
-- específica de rol (alumno/instructor/...) se crea después, desde un
-- Server Action autenticado, para poder validar con Zod y RLS.
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role_text text;
  requested_role public.user_role;
  safe_full_name text;
begin
  -- IMPORTANTE: raw_user_meta_data es controlado por quien llama a signUp().
  -- Nunca se acepta `admin` desde el registro público. Solo los cuatro
  -- roles de autoservicio pueden crearse mediante Auth.
  requested_role_text := lower(coalesce(new.raw_user_meta_data ->> 'role', ''));

  if requested_role_text in ('alumno', 'instructor', 'externo', 'expositor') then
    requested_role := requested_role_text::public.user_role;
  else
    requested_role := 'alumno';
  end if;

  -- Normaliza el nombre para que una llamada directa a Auth con metadata
  -- vacía o malformada no haga fallar el trigger ni el alta de la cuenta.
  safe_full_name := btrim(coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  if char_length(safe_full_name) < 2 then
    safe_full_name := 'Usuario';
  else
    safe_full_name := left(safe_full_name, 150);
  end if;

  insert into public.profiles (id, role, full_name)
  values (new.id, requested_role, safe_full_name)
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
