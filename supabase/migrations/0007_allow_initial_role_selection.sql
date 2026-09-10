-- ============================================================
-- MIGRACIÓN 0007: permitir selección de rol antes del onboarding
-- El usuario puede elegir entre los cuatro roles públicos
-- únicamente mientras onboarding_completed = false.
-- Después de completar el registro, el rol vuelve a ser inmutable.
-- ============================================================

create or replace function public.prevent_role_self_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role <> old.role
     and auth.uid() = old.id
     and not public.is_admin() then

    -- Durante el onboarding inicial sí puede cambiar entre roles públicos.
    if old.onboarding_completed = false
       and new.onboarding_completed = false
       and new.role in (
         'alumno'::public.user_role,
         'instructor'::public.user_role,
         'externo'::public.user_role,
         'expositor'::public.user_role
       ) then
      -- Cambio permitido.
      null;
    else
      raise exception 'No tienes permiso para cambiar tu propio rol';
    end if;
  end if;

  -- onboarding_completed solo puede activarlo el trigger interno
  -- después de crear correctamente el perfil específico del rol.
  if new.onboarding_completed <> old.onboarding_completed
     and auth.uid() = old.id
     and not public.is_admin()
     and pg_trigger_depth() <= 1 then
    raise exception 'El estado de onboarding no puede modificarse directamente';
  end if;

  new.created_at := old.created_at;

  return new;
end;
$$;