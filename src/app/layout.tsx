import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sistema de Registro | Plataforma de Acreditación",
    template: "%s | Sistema de Registro",
  },
  description:
    "Plataforma de registro y acreditación para Alumnos, Instructores, Externos y Expositores. Regístrate de forma segura y gestiona tu perfil.",
  keywords: ["registro", "acreditación", "alumnos", "instructores", "expositores", "eventos"],
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: siteUrl,
    siteName: "Sistema de Registro",
    title: "Sistema de Registro | Plataforma de Acreditación",
    description:
      "Regístrate como Alumno, Instructor, Externo o Expositor y gestiona tu acreditación de forma segura.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
