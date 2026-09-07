"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Presentation,
  ShieldCheck,
  Terminal,
  User,
  Users,
  X,
} from "lucide-react";
import { logoutAction } from "@/app/auth/login/actions";
import type { ProfileRow } from "@/types/database";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
};

export function DashboardShell({
  profile,
  children,
}: {
  profile: ProfileRow;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const role = profile.role;
  const isTeacher = role === "instructor" || role === "expositor";
  const isAdmin = role === "admin";

  const navigation: NavItem[] = [
    {
      label: "Inicio",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Cursos",
      href: "/dashboard/courses",
      icon: BookOpen,
      
    },
    {
      label: "Eventos",
      href: "/dashboard/events",
      icon: CalendarDays,
      disabled: true,
    },
    {
      label: "Comunidad",
      href: "/dashboard/community",
      icon: MessageCircle,
      disabled: true,
    },
    ...(isTeacher
      ? [
          {
            label: role === "expositor" ? "Mis ponencias" : "Mis contenidos",
            href: "/dashboard/content",
            icon: role === "expositor" ? Presentation : GraduationCap,
            disabled: true,
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            label: "Administración",
            href: "/dashboard/admin",
            icon: ShieldCheck,
            disabled: true,
          },
          {
            label: "Usuarios",
            href: "/dashboard/users",
            icon: Users,
            disabled: true,
          },
        ]
      : []),
    {
      label: "Mi perfil",
      href: "/dashboard/profile",
      icon: User,
    },
  ];

  const roleLabel: Record<string, string> = {
    alumno: "Alumno",
    externo: "Miembro externo",
    instructor: "Instructor",
    expositor: "Expositor",
    admin: "Administrador",
  };

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  function SidebarContent() {
    return (
      <>
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-purple-600">
              <Terminal className="h-5 w-5 text-white" />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">
                  Comunidad UNIX
                </p>
                <p className="text-[10px] font-medium tracking-[0.2em] text-slate-500">
                  ITC
                </p>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navegación */}
        <nav
          className="flex flex-1 flex-col gap-1 overflow-y-auto p-3"
          aria-label="Navegación del panel"
        >
          {!collapsed && (
            <p className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Menú principal
            </p>
          )}

          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            if (item.disabled) {
              return (
                <div
                  key={item.label}
                  title={collapsed ? item.label : undefined}
                  className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-600"
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      <span className="text-[9px] text-slate-600">Pronto</span>
                    </>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                title={collapsed ? item.label : undefined}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-gradient-to-r from-orange-500/15 to-purple-500/15 text-orange-300"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Usuario y cerrar sesión */}
        <div className="border-t border-white/10 p-3">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500/30 to-purple-500/30 text-sm font-bold text-white">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {profile.full_name}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {roleLabel[role] ?? role}
                </p>
              </div>
            )}
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              title={collapsed ? "Cerrar sesión" : undefined}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!collapsed && <span>Cerrar sesión</span>}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="mt-2 hidden w-full items-center justify-center rounded-xl border border-white/10 py-2 text-slate-500 hover:bg-white/5 hover:text-white lg:flex"
            aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1026] text-white">
      {/* Menú móvil */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/70"
            aria-label="Cerrar menú"
          />
          <aside className="relative flex h-full w-72 flex-col border-r border-white/10 bg-[#0f1630]">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Sidebar escritorio */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-white/10 bg-[#0f1630] transition-all duration-300 lg:flex ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Contenido principal */}
      <div
        className={`min-h-screen transition-all duration-300 ${
          collapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        {/* Barra superior móvil */}
        <header className="flex h-16 items-center justify-between border-b border-white/10 bg-[#0f1630] px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-slate-300 hover:bg-white/5"
            aria-label="Abrir menú"
          >
            <Menu className="h-6 w-6" />
          </button>

          <span className="text-sm font-bold">
            Comunidad UNIX ITC
          </span>

          <Link
            href="/dashboard/profile"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-semibold"
          >
            {profile.full_name.charAt(0).toUpperCase()}
          </Link>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}