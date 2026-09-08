"use client";

import Shell from "@/components/Shell";
import { countries } from "@/lib/countries";
import { number, pct } from "@/lib/format";

function BarChart({ title, unit, data }: { title: string; unit?: string; data: { label: string; flag: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <article className="mini-panel" style={{ minHeight: "auto" }}>
      <div className="mini-head"><h3>{title}</h3></div>
      <div className="bar-list">
        {data.map((d) => (
          <div className="bar-row" key={d.label}>
            <span className="bar-label">{d.flag} {d.label}</span>
            <div className="bar-track"><div className="bar-fill" style={{ width: `${(d.value / max) * 100}%` }} /></div>
            <span className="bar-value">{unit === "%" ? pct(d.value) : number(d.value)}{unit && unit !== "%" ? ` ${unit}` : ""}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function MercadoPage() {
  const byMarket = [...countries].sort((a, b) => b.market - a.market).map((c) => ({ label: c.name, flag: c.flag, value: c.market }));
  const byPenetration = [...countries]
    .map((c) => ({ label: c.name, flag: c.flag, value: c.market > 0 ? (c.customers / c.market) * 100 : 0 }))
    .sort((a, b) => b.value - a.value);
  const byOob = [...countries].sort((a, b) => b.oobMinutesPerLine - a.oobMinutesPerLine).map((c) => ({ label: c.name, flag: c.flag, value: c.oobMinutesPerLine }));

  return (
    <Shell eyebrow="Mercado" title="Análisis de mercado" subtitle="Comparativa de mercado potencial, penetración y consumo fuera de bundle por país.">
      <div className="lower-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
        <BarChart title="MERCADO POTENCIAL" data={byMarket} />
        <BarChart title="PENETRACIÓN VODAFONE" unit="%" data={byPenetration} />
        <BarChart title="CONSUMO OOB (MIN/LÍNEA)" unit="min" data={byOob} />
      </div>
    </Shell>
  );
}
