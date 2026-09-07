export function PublicFooter() {
  return (
    <footer className="border-t border-surface-200 bg-white">
      <div className="container-app flex flex-col items-center justify-between gap-4 py-8 text-sm text-surface-500 sm:flex-row">
        <p>© {new Date().getFullYear()} Sistema de Registro. Todos los derechos reservados.</p>
        <p>Plataforma de acreditación para Alumnos, Instructores, Externos y Expositores.</p>
      </div>
    </footer>
  );
}
