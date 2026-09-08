"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Shell from "@/components/Shell";
import { countries } from "@/lib/countries";
import { number, pct } from "@/lib/format";

type SortKey = "score" | "market" | "customers" | "penetration";

const SORT_LABELS: Record<SortKey, string> = {
  score: "Score",
  market: "Mercado potencial",
  customers: "Clientes Vodafone",
  penetration: "Penetración",
};

export default function PortfolioPage() {
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [asc, setAsc] = useState(false);

  const rows = useMemo(() => {
    const withPenetration = countries.map((c) => ({ ...c, penetration: c.market > 0 ? (c.customers / c.market) * 100 : 0 }));
    return withPenetration.sort((a, b) => (asc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]));
  }, [sortKey, asc]);

  return (
    <Shell eyebrow="Portfolio" title="Cartera completa de países" subtitle="Todos los países en cartera, ordenables por la métrica que quieras analizar.">
      <section className="panel">
        <div className="panel-toolbar">
          <div className="section-title"><h2>PORTFOLIO <span>· {countries.length} países</span></h2></div>
          <div className="toolbar-actions">
            <label className="select-field" style={{ margin: 0 }}>
              <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
                {Object.entries(SORT_LABELS).map(([key, label]) => <option key={key} value={key}>Ordenar por: {label}</option>)}
              </select>
            </label>
            <button type="button" className="map-button" onClick={() => setAsc((v) => !v)}>{asc ? "↑ Ascendente" : "↓ Descendente"}</button>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="compare-table">
            <thead>
              <tr><th>#</th><th>País</th><th>Mercado potencial</th><th>Clientes Vodafone</th><th>Penetración</th><th>Score</th><th>Prioridad</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map((c, i) => (
                <tr key={c.name}>
                  <td>{i + 1}</td>
                  <td>{c.flag} {c.name}</td>
                  <td>{number(c.market)}</td>
                  <td>{number(c.customers)}</td>
                  <td>{pct(c.penetration)}</td>
                  <td>{c.score}</td>
                  <td>{c.priority}</td>
                  <td><Link href={`/business-case?country=${encodeURIComponent(c.name)}`}>Business case →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Shell>
  );
}
