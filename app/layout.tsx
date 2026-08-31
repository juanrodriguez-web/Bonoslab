import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BonosLab | Decision Lab",
  description: "Herramienta interna para analizar oportunidades de bonos internacionales",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
