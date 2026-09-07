-- =====================================================================
-- MIGRACIÓN 0003: VISTAS DE CONSULTA
-- Vista unificada de solo lectura para pantallas administrativas y
-- reportes futuros, sin duplicar datos (JOIN dinámico).
-- security_invoker asegura que la vista respeta el RLS del usuario que
-- consulta, no del creador de la vista.
-- =====================================================================

create or replace view public.people_directory
with (security_invoker = on) as
select
  p.id as profile_id,
  p.role,
  p.full_name,
  p.phone,
  p.created_at,
  case p.role
    when 'alumno' then a.control_number
    when 'instructor' then i.control_number
    else null
  end as control_number,
  case p.role
    when 'externo' then e.public_code
    when 'expositor' then x.public_code
    else null
  end as public_code,
  case p.role
    when 'alumno' then a.institution_type
    when 'externo' then e.institution_type
    when 'expositor' then x.institution_type
    else null
  end as institution_type,
  case p.role
    when 'alumno' then coalesce(a.institution_other_name, a.institution_type::text)
    when 'externo' then coalesce(e.institution_other_name, e.institution_type::text)
    when 'expositor' then coalesce(x.institution_other_name, x.institution_type::text)
    else null
  end as institution_label
from public.profiles p
left join public.alumno_profiles a on a.profile_id = p.id and p.role = 'alumno'
left join public.instructor_profiles i on i.profile_id = p.id and p.role = 'instructor'
left join public.externo_profiles e on e.profile_id = p.id and p.role = 'externo'
left join public.expositor_profiles x on x.profile_id = p.id and p.role = 'expositor';

comment on view public.people_directory is
  'Vista unificada de personas registradas (todas las tablas de rol). Respeta RLS del usuario (security_invoker).';
