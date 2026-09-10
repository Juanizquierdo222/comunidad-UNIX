-- ============================================================
-- MIGRACIÓN 0006: selección inicial de rol durante onboarding
-- Permite elegir/corregir el rol únicamente antes de completar
-- el onboarding. Nunca permite autoasignarse admin.
-- ============================================================

create or replace function public.set_onboarding_role(
  requested_role public.user_role
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_onboarding_completed boolean;
begin
  if current_user_id is null then
    raise exception 'Debes iniciar sesión';
  end if;

  if requested_role not in (
    'alumno'::public.user_role,
    'instructor'::public.user_role,
    'externo'::public.user_role,
    'expositor'::public.user_role
  ) then
    raise exception 'Rol no permitido';
  end if;

  select p.onboarding_completed
    into current_onboarding_completed
  from public.profiles p
  where p.id = current_user_id;

  if not found then
    raise exception 'Perfil no encontrado';
  end if;

  if current_onboarding_completed then
    raise exception 'El registro ya fue completado';
  end if;

  update public.profiles
  set role = requested_role
  where id = current_user_id;
end;
$$;

revoke all on function public.set_onboarding_role(public.user_role) from public;
grant execute on function public.set_onboarding_role(public.user_role) to authenticated;