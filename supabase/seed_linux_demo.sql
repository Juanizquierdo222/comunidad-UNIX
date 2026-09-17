-- ============================================================

-- Comunidad UNIX ITC

-- Seed local: Linux desde cero - Curso piloto

-- SOLO PARA DESARROLLO LOCAL

-- ============================================================

begin;

-- El curso piloto ya está publicado.

-- Para cargar exclusivamente este contenido DEMO desde PostgreSQL local,

-- desactivamos temporalmente los triggers de edición del temario.

alter table public.courses disable trigger trg_guard_course;
alter table public.course_modules disable trigger trg_guard_modules;
alter table public.course_lessons disable trigger trg_guard_lessons;

do $$

declare

  v_course_id uuid;

  v_creator_id uuid;

  v_module_id uuid;

begin

  -- ----------------------------------------------------------
  -- LOCALIZAR CREADOR LOCAL
  -- ----------------------------------------------------------
  select p.id
    into v_creator_id
  from public.profiles p
  where p.role = 'instructor'::public.user_role
    and p.onboarding_completed = true
  order by p.created_at
  limit 1;

  if v_creator_id is null then
    raise exception
      'No hay un instructor con onboarding completo. Crea primero una cuenta local de instructor y completa su registro.';
  end if;

  -- ----------------------------------------------------------
  -- CREAR O ACTUALIZAR CURSO PILOTO
  -- ----------------------------------------------------------
  select c.id
    into v_course_id
  from public.courses c
  where c.slug = 'linux-desde-cero-piloto'
  limit 1;

  if v_course_id is null then
    insert into public.courses (
      creator_id, title, slug, description, category, level,
      estimated_minutes, status, published_at
    )
    values (
      v_creator_id,
      'Linux desde cero - Curso piloto',
      'linux-desde-cero-piloto',
      'Curso gratuito para estudiantes que introduce los fundamentos de Linux, la terminal, el sistema de archivos, permisos, procesos, redes, paquetes y administración básica.',
      'Fundamentos',
      'principiante',
      560,
      'published'::public.course_status,
      now()
    )
    returning id into v_course_id;
  else
    update public.courses
    set title = 'Linux desde cero - Curso piloto',
        description = 'Curso gratuito para estudiantes que introduce los fundamentos de Linux, la terminal, el sistema de archivos, permisos, procesos, redes, paquetes y administración básica.',
        category = 'Fundamentos',
        level = 'principiante',
        estimated_minutes = 560,
        status = 'published'::public.course_status,
        published_at = coalesce(published_at, now())
    where id = v_course_id;
  end if;

  -- ----------------------------------------------------------

  -- ELIMINAR TEMARIO DEMO ANTERIOR

  -- ----------------------------------------------------------

  delete from public.course_modules

  where course_id = v_course_id;

  -- ==========================================================

  -- MÓDULO 1

  -- ==========================================================

  insert into public.course_modules

    (course_id, title, description, position)

  values

    (

      v_course_id,

      'Módulo 1: Introducción a Linux',

      'Conceptos fundamentales para comenzar a utilizar Linux.',

      0

    )

  returning id into v_module_id;

  insert into public.course_lessons

    (module_id, title, content, position, estimated_minutes, is_preview)

  values

    (

      v_module_id,

      '¿Qué es Linux?',

      'Linux es un sistema operativo de código abierto basado en Unix. En esta lección conocerás sus características principales, su filosofía y por qué es utilizado en servidores, computadoras personales, dispositivos móviles y sistemas embebidos.',

      0,

      10,

      true

    ),

    (

      v_module_id,

      'Historia de Linux y GNU',

      'Conoce los antecedentes de Unix, el proyecto GNU, el nacimiento del kernel Linux y la importancia del software libre en el desarrollo de los sistemas GNU/Linux.',

      1,

      12,

      false

    ),

    (

      v_module_id,

      'Distribuciones de Linux',

      'Aprende qué es una distribución de Linux y conoce algunas de las más populares como Ubuntu, Debian, Fedora, Arch Linux y Linux Mint.',

      2,

      12,

      false

    ),

    (

      v_module_id,

      'Instalación y primeros pasos',

      'Conoce los conceptos básicos necesarios para instalar una distribución Linux y familiarizarte con el escritorio, las aplicaciones y las principales opciones del sistema.',

      3,

      15,

      false

    );

  -- ==========================================================

  -- MÓDULO 2

  -- ==========================================================

  insert into public.course_modules

    (course_id, title, description, position)

  values

    (

      v_course_id,

      'Módulo 2: Terminal y comandos básicos',

      'Aprende a utilizar la terminal y los comandos esenciales de Linux.',

      1

    )

  returning id into v_module_id;

  insert into public.course_lessons

    (module_id, title, content, position, estimated_minutes, is_preview)

  values

    (

      v_module_id,

      'Conociendo la terminal',

      'La terminal permite interactuar con Linux mediante comandos. Aprenderás qué es una shell, cómo abrir una terminal y cómo interpretar el prompt.',

      0,

      10,

      false

    ),

    (

      v_module_id,

      'Navegación con pwd, cd y ls',

      'Aprende a identificar el directorio actual con pwd, cambiar de directorio con cd y visualizar archivos y carpetas utilizando ls.',

      1,

      15,

      false

    ),

    (

      v_module_id,

      'Crear archivos y directorios',

      'Utiliza mkdir para crear directorios y touch para crear archivos desde la terminal.',

      2,

      12,

      false

    ),

    (

      v_module_id,

      'Copiar, mover y eliminar',

      'Aprende a utilizar cp, mv y rm para administrar archivos y directorios desde la línea de comandos.',

      3,

      15,

      false

    ),

    (

      v_module_id,

      'Leer archivos desde la terminal',

      'Utiliza comandos como cat, less, head y tail para consultar el contenido de archivos de texto.',

      4,

      12,

      false

    );

  -- ==========================================================

  -- MÓDULO 3

  -- ==========================================================

  insert into public.course_modules

    (course_id, title, description, position)

  values

    (

      v_course_id,

      'Módulo 3: Sistema de archivos',

      'Comprende cómo Linux organiza archivos, directorios y rutas.',

      2

    )

  returning id into v_module_id;

  insert into public.course_lessons

    (module_id, title, content, position, estimated_minutes, is_preview)

  values

    (

      v_module_id,

      'Estructura de directorios de Linux',

      'Conoce los directorios principales del sistema Linux como /home, /etc, /var, /usr, /tmp y /root, y comprende para qué se utiliza cada uno.',

      0,

      15,

      false

    ),

    (

      v_module_id,

      'Rutas absolutas y relativas',

      'Aprende la diferencia entre rutas absolutas y relativas y cómo utilizarlas para desplazarte eficientemente por el sistema.',

      1,

      12,

      false

    ),

    (

      v_module_id,

      'Buscar archivos con find',

      'Utiliza el comando find para localizar archivos y directorios aplicando diferentes criterios de búsqueda.',

      2,

      15,

      false

    ),

    (

      v_module_id,

      'Enlaces simbólicos y enlaces duros',

      'Conoce las diferencias entre enlaces simbólicos y enlaces duros y aprende a crearlos utilizando ln.',

      3,

      15,

      false

    );

  -- ==========================================================

  -- MÓDULO 4

  -- ==========================================================

  insert into public.course_modules

    (course_id, title, description, position)

  values

    (

      v_course_id,

      'Módulo 4: Usuarios y permisos',

      'Administra usuarios, grupos y permisos de archivos en Linux.',

      3

    )

  returning id into v_module_id;

  insert into public.course_lessons

    (module_id, title, content, position, estimated_minutes, is_preview)

  values

    (

      v_module_id,

      'Usuarios y grupos',

      'Comprende cómo Linux administra usuarios y grupos y por qué son fundamentales para la seguridad del sistema.',

      0,

      15,

      false

    ),

    (

      v_module_id,

      'Permisos de archivos',

      'Aprende los permisos de lectura, escritura y ejecución y cómo se aplican al propietario, grupo y otros usuarios.',

      1,

      15,

      false

    ),

    (

      v_module_id,

      'Uso de chmod',

      'Aprende a modificar permisos mediante chmod utilizando tanto la notación simbólica como la notación numérica.',

      2,

      18,

      false

    ),

    (

      v_module_id,

      'Uso de chown',

      'Utiliza chown para cambiar el propietario y el grupo asociado a archivos y directorios.',

      3,

      12,

      false

    ),

    (

      v_module_id,

      'Introducción a sudo',

      'Comprende para qué sirve sudo y cómo permite ejecutar tareas administrativas de manera controlada.',

      4,

      12,

      false

    );

  -- ==========================================================

  -- MÓDULO 5

  -- ==========================================================

  insert into public.course_modules

    (course_id, title, description, position)

  values

    (

      v_course_id,

      'Módulo 5: Procesos y administración básica',

      'Supervisa procesos, servicios y recursos del sistema.',

      4

    )

  returning id into v_module_id;

  insert into public.course_lessons

    (module_id, title, content, position, estimated_minutes, is_preview)

  values

    (

      v_module_id,

      'Procesos en Linux',

      'Aprende qué es un proceso y cómo Linux administra los programas que se encuentran en ejecución.',

      0,

      12,

      false

    ),

    (

      v_module_id,

      'Comandos ps, top y htop',

      'Utiliza diferentes herramientas para visualizar procesos y supervisar el consumo de recursos del sistema.',

      1,

      15,

      false

    ),

    (

      v_module_id,

      'Finalizar procesos con kill',

      'Aprende a identificar procesos y enviar señales utilizando los comandos kill y killall.',

      2,

      12,

      false

    ),

    (

      v_module_id,

      'Servicios con systemctl',

      'Conoce systemd y utiliza systemctl para consultar, iniciar, detener y reiniciar servicios.',

      3,

      18,

      false

    ),

    (

      v_module_id,

      'Disco y memoria',

      'Utiliza comandos como df, du y free para consultar almacenamiento y memoria disponibles.',

      4,

      15,

      false

    );

  -- ==========================================================

  -- MÓDULO 6

  -- ==========================================================

  insert into public.course_modules

    (course_id, title, description, position)

  values

    (

      v_course_id,

      'Módulo 6: Redes en Linux',

      'Aprende los conceptos y comandos fundamentales de redes.',

      5

    )

  returning id into v_module_id;

  insert into public.course_lessons

    (module_id, title, content, position, estimated_minutes, is_preview)

  values

    (

      v_module_id,

      'Conceptos básicos de red',

      'Introducción a direcciones IP, máscaras de red, puertas de enlace, DNS y otros conceptos fundamentales de comunicación en red.',

      0,

      18,

      false

    ),

    (

      v_module_id,

      'Consultar la configuración IP',

      'Utiliza el comando ip para consultar interfaces, direcciones IP y rutas configuradas en Linux.',

      1,

      15,

      false

    ),

    (

      v_module_id,

      'Probar conectividad con ping',

      'Aprende a utilizar ping para comprobar conectividad entre dispositivos y diagnosticar problemas básicos de red.',

      2,

      12,

      false

    ),

    (

      v_module_id,

      'DNS y resolución de nombres',

      'Comprende cómo funciona la resolución de nombres y conoce herramientas para realizar consultas DNS.',

      3,

      15,

      false

    ),

    (

      v_module_id,

      'Conexiones y puertos',

      'Aprende a consultar conexiones de red y puertos utilizando herramientas disponibles en Linux.',

      4,

      15,

      false

    );

  -- ==========================================================

  -- MÓDULO 7

  -- ==========================================================

  insert into public.course_modules

    (course_id, title, description, position)

  values

    (

      v_course_id,

      'Módulo 7: Paquetes y software',

      'Instala, actualiza y administra software en Linux.',

      6

    )

  returning id into v_module_id;

  insert into public.course_lessons

    (module_id, title, content, position, estimated_minutes, is_preview)

  values

    (

      v_module_id,

      '¿Qué es un gestor de paquetes?',

      'Comprende cómo funcionan los gestores de paquetes y por qué facilitan la instalación y actualización de software.',

      0,

      12,

      false

    ),

    (

      v_module_id,

      'Instalar software con APT',

      'Aprende a buscar e instalar paquetes utilizando APT en distribuciones basadas en Debian y Ubuntu.',

      1,

      15,

      false

    ),

    (

      v_module_id,

      'Actualizar el sistema',

      'Utiliza apt update y apt upgrade para mantener actualizados los paquetes instalados.',

      2,

      12,

      false

    ),

    (

      v_module_id,

      'Eliminar paquetes',

      'Aprende a eliminar software y dependencias utilizando las diferentes opciones disponibles en APT.',

      3,

      12,

      false

    ),

    (

      v_module_id,

      'Introducción a repositorios',

      'Comprende qué son los repositorios de software y cómo se utilizan para distribuir paquetes.',

      4,

      15,

      false

    );

  -- ==========================================================

  -- MÓDULO 8

  -- ==========================================================

  insert into public.course_modules

    (course_id, title, description, position)

  values

    (

      v_course_id,

      'Módulo 8: Proyecto final',

      'Aplica los conocimientos adquiridos durante el curso.',

      7

    )

  returning id into v_module_id;

  insert into public.course_lessons

    (module_id, title, content, position, estimated_minutes, is_preview)

  values

    (

      v_module_id,

      'Preparar un entorno Linux',

      'Configura un entorno Linux que utilizarás para realizar las actividades del proyecto final.',

      0,

      20,

      false

    ),

    (

      v_module_id,

      'Crear usuarios y permisos',

      'Crea usuarios y grupos y configura los permisos necesarios para diferentes archivos y directorios.',

      1,

      20,

      false

    ),

    (

      v_module_id,

      'Instalar y configurar software',

      'Utiliza el gestor de paquetes para instalar y preparar las herramientas requeridas en el proyecto.',

      2,

      20,

      false

    ),

    (

      v_module_id,

      'Diagnosticar red y procesos',

      'Utiliza los comandos aprendidos durante el curso para comprobar procesos, servicios y conectividad.',

      3,

      25,

      false

    ),

    (

      v_module_id,

      'Evaluación final',

      'Repasa los principales conceptos del curso y comprueba los conocimientos adquiridos durante los ocho módulos.',

      4,

      20,

      false

    );

end $$;

-- Reactivamos inmediatamente las protecciones.

alter table public.course_modules enable trigger trg_guard_modules;
alter table public.course_lessons enable trigger trg_guard_lessons;
alter table public.courses enable trigger trg_guard_course;

commit;
