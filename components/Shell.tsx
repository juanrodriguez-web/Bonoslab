"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems: [string, string, string][] = [
  ["▦", "Dashboard", "/"],
  ["◉", "Mercado", "/mercado"],
  ["▣", "Portfolio", "/portfolio"],
  ["▤", "Business Case", "/business-case"],
  ["▥", "Simulador", "/simulador"],
  ["✧", "Decision Lab", "/decision-lab"],
  ["⌁", "Escenarios", "/escenarios"],
  ["▧", "Informes", "/informes"],
  ["◫", "Datos", "/datos"],
  ["⚙", "Administración", "/administracion"],
];

export default function Shell({ eyebrow, title, subtitle, children }: { eyebrow: string; title: ReactNode; subtitle: string; children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="shell dark-shell">
      <aside className="sidebar">
        <div className="brand-wrap"><img src="/vodafone-logo.png" alt="Vodafone" className="vodafone-mark" /><div><strong><i>Product</i>lab</strong><small>Prepago</small></div></div>
        <nav>{navItems.map(([icon, item, href]) => (
          <Link key={item} href={href} className={pathname === href ? "active" : ""}>
            <span>{icon}</span>{item}{item === "Decision Lab" && <em>NUEVO</em>}
          </Link>
        ))}</nav>
        <div className="sidebar-spacer" />
        <div className="dataset-card"><div><span>Dataset activo</span><b>2026.08.05-R01</b></div><i className="status-dot" /><hr/><div><span>Última actualización</span><b>05/08/2026 19:18</b></div></div>
        <footer><span>© Vodafone España</span><span>v1.1.0</span></footer>
      </aside>

      <main className="content">
        <header className="topbar">
          <div className="title-block"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{subtitle}</p></div>
          <div className="header-actions"><button className="secondary">Vista ejecutiva⌄</button><button className="notification">♧<b>3</b></button><button className="avatar">JR</button></div>
        </header>
        {children}
      </main>
    </div>
  );
}
