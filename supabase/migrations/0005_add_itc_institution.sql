-- ============================================================
-- MIGRACIÓN 0005: Instituto Tecnológico de Cancún
-- Agrega ITC como institución disponible.
-- ============================================================

alter type public.institution_type
add value if not exists 'ITC';