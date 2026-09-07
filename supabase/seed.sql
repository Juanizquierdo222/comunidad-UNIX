-- =====================================================================
-- SEED.SQL — Datos de ejemplo para desarrollo LOCAL (supabase start).
-- No se ejecuta automáticamente en producción.
--
-- Nota: no se insertan usuarios de auth.users aquí porque Supabase Auth
-- gestiona esa tabla internamente (hashing de contraseñas, etc.). Para
-- crear usuarios de prueba con contraseña, usa el Dashboard de Supabase
-- (Authentication > Users > Add user) o el comando:
--   supabase auth users create --email demo@example.com --password ...
-- y luego completa su perfil de rol usando la app (formulario de
-- registro), que es el flujo real que se probará en producción.
-- =====================================================================

-- Este archivo se deja intencionalmente sin inserts de negocio: el
-- objetivo del proyecto es probar el flujo real de registro por rol
-- (con validaciones y triggers) en lugar de datos precargados.
select 1;
