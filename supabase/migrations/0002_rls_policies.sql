-- =====================================================================
-- MIGRACIÓN 0002: ROW LEVEL SECURITY
-- Principio: DENEGAR POR DEFECTO. Se habilita RLS en todas las tablas
-- y se agregan políticas explícitas mínimas necesarias.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Función auxiliar SECURITY DEFINER para saber si el usuario actual es
-- admin, sin causar recursión infinita al consultar `profiles` desde
-- una policy de la propia tabla `profiles`.
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.current_role_matches(expected public.user_role)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = expected
  );
$$;

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

-- No existe policy de INSERT para `profiles`: la fila se crea exclusivamente
-- mediante el trigger SECURITY DEFINER `on_auth_user_created`. Así un cliente
-- autenticado no puede fabricar manualmente un profile (mucho menos uno admin).

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- No se permite DELETE desde el cliente (ni siquiera al propio usuario);
-- las bajas de cuenta se gestionan vía soporte/admin con service_role.

-- ---------------------------------------------------------------------
-- alumno_profiles
-- ---------------------------------------------------------------------
alter table public.alumno_profiles enable row level security;

create policy "alumno_select_own_or_admin"
  on public.alumno_profiles for select
  using (profile_id = auth.uid() or public.is_admin());

create policy "alumno_insert_own"
  on public.alumno_profiles for insert
  with check (profile_id = auth.uid() and public.current_role_matches('alumno'));

create policy "alumno_update_own_or_admin"
  on public.alumno_profiles for update
  using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------
-- instructor_profiles
-- ---------------------------------------------------------------------
alter table public.instructor_profiles enable row level security;

create policy "instructor_select_own_or_admin"
  on public.instructor_profiles for select
  using (profile_id = auth.uid() or public.is_admin());

create policy "instructor_insert_own"
  on public.instructor_profiles for insert
  with check (profile_id = auth.uid() and public.current_role_matches('instructor'));

create policy "instructor_update_own_or_admin"
  on public.instructor_profiles for update
  using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------
-- externo_profiles
-- ---------------------------------------------------------------------
alter table public.externo_profiles enable row level security;

create policy "externo_select_own_or_admin"
  on public.externo_profiles for select
  using (profile_id = auth.uid() or public.is_admin());

create policy "externo_insert_own"
  on public.externo_profiles for insert
  with check (profile_id = auth.uid() and public.current_role_matches('externo'));

create policy "externo_update_own_or_admin"
  on public.externo_profiles for update
  using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------
-- expositor_profiles
-- ---------------------------------------------------------------------
alter table public.expositor_profiles enable row level security;

create policy "expositor_select_own_or_admin"
  on public.expositor_profiles for select
  using (profile_id = auth.uid() or public.is_admin());

create policy "expositor_insert_own"
  on public.expositor_profiles for insert
  with check (profile_id = auth.uid() and public.current_role_matches('expositor'));

create policy "expositor_update_own_or_admin"
  on public.expositor_profiles for update
  using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------
-- Nota de seguridad importante:
-- Las políticas de INSERT impiden que un usuario cree un registro en
-- una tabla de rol distinta a la de su `profiles.role`. Esto evita que,
-- por ejemplo, un usuario con rol 'alumno' manipule el request e inserte
-- una fila en `expositor_profiles`. El cambio de rol únicamente puede
-- hacerlo un administrador ya autorizado (vía policy
-- "profiles_update_own_or_admin"), nunca el propio usuario. El rol `admin`
-- tampoco puede solicitarse durante signUp(); `handle_new_user()` lo bloquea.

-- ---------------------------------------------------------------------

-- Los usuarios no-admin NO deben poder cambiar su propio `role` una vez
-- creado el perfil. Se refuerza con un trigger adicional porque una
-- policy USING/WITH CHECK no puede comparar OLD vs NEW por columna.
create or replace function public.prevent_role_self_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Un usuario autenticado no puede cambiar su propio rol. Un admin sí
  -- puede cambiar el rol de otros usuarios y una sesión privilegiada de DB
  -- (por ejemplo SQL Editor, donde auth.uid() es NULL) no queda bloqueada.
  if new.role <> old.role
     and auth.uid() = old.id
     and not public.is_admin() then
    raise exception 'No tienes permiso para cambiar tu propio rol';
  end if;

  -- `onboarding_completed` solo lo activa el trigger AFTER INSERT de la
  -- tabla específica de rol. Bloqueamos cambios directos desde el cliente.
  -- pg_trigger_depth() > 1 identifica la actualización anidada originada
  -- por `mark_profile_onboarded()`.
  if new.onboarding_completed <> old.onboarding_completed
     and auth.uid() = old.id
     and not public.is_admin()
     and pg_trigger_depth() <= 1 then
    raise exception 'El estado de onboarding no puede modificarse directamente';
  end if;

  -- `created_at` es inmutable incluso si el cliente lo envía en un UPDATE.
  new.created_at := old.created_at;

  return new;
end;
$$;

create trigger trg_prevent_role_self_change
  before update on public.profiles
  for each row execute function public.prevent_role_self_change();
