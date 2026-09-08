"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Shell from "@/components/Shell";
import SliderField from "@/components/SliderField";
import { annualRoi, calculateScenario, getRecommendation, recommendationRank } from "@/lib/calculations";
import { countries } from "@/lib/countries";
import { money } from "@/lib/format";

export default function DecisionLabPage() {
  const [price, setPrice] = useState(5);
  const [minutes, setMinutes] = useState(100);
  const [usage, setUsage] = useState(42);
  const [wholesale, setWholesale] = useState(0.018);
  const [targetCustomers, setTargetCustomers] = useState(3100);
  const [capex, setCapex] = useState(50000);

  const rows = useMemo(
    () => countries
      .map((country) => {
        // "Clientes objetivo" can't exceed each country's real customer base.
        const scenario = calculateScenario({ price, minutes, wholesaleCostPerMinute: wholesale, expectedUsagePct: usage, targetCustomers: Math.min(targetCustomers, country.customers), capex });
        const roi = annualRoi(scenario.annualMargin, capex);
        return { country, scenario, roi, recommendation: getRecommendation(scenario) };
      })
      .sort((a, b) => recommendationRank(a.recommendation) - recommendationRank(b.recommendation) || b.roi - a.roi),
    [price, minutes, usage, wholesale, targetCustomers, capex]
  );

  return (
    <Shell
      eyebrow="Decision Lab"
      title="Laboratorio de decisiones"
      subtitle="Aplica un mismo diseño de bono a los 5 países de la cartera y compara cuáles merece la pena desarrollar."
    >
      <div className="grid-main">
        <section className="panel">
          <div className="panel-toolbar"><div className="section-title"><h2>RANKING <span>· por recomendación y ROI</span></h2></div></div>
          <div style={{ overflowX: "auto" }}>
            <table className="compare-table">
              <thead>
                <tr><th>#</th><th>País</th><th>Margen anual</th><th>Payback</th><th>ROI</th><th>Recomendación</th><th></th></tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.country.name}>
                    <td>{i + 1}</td>
                    <td>{r.country.flag} {r.country.name}</td>
                    <td>{money(r.scenario.annualMargin)}</td>
                    <td>{r.scenario.paybackMonths === null ? "N/A" : `${r.scenario.paybackMonths.toFixed(1)} meses`}</td>
                    <td>{r.roi.toFixed(0)}%</td>
                    <td>{r.recommendation}</td>
                    <td><Link href={`/business-case?country=${encodeURIComponent(r.country.name)}`}>Ver caso →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="panel simulator">
          <div className="sim-head"><div><h2>DISEÑO DEL BONO</h2></div></div>
          <div className="slider-stack">
            <SliderField label="PRECIO DEL BONO" value={price} min={1} max={20} step={0.5} suffix=" €" onChange={setPrice} />
            <SliderField label="MINUTOS INCLUIDOS" value={minutes} min={0} max={500} step={10} onChange={setMinutes} />
            <SliderField label="UTILIZACIÓN ESPERADA" value={usage} min={10} max={100} step={1} suffix="%" onChange={setUsage} />
            <SliderField label="CLIENTES OBJETIVO" value={targetCustomers} min={100} max={50000} step={100} onChange={setTargetCustomers} />
          </div>
          <div className="control-grid">
            <label>WHOLESALE €/MIN<input type="number" step="0.001" min="0" value={wholesale} onChange={(e) => setWholesale(Number(e.target.value))} /></label>
            <label>CAPEX (€)<input type="number" min="0" value={capex} onChange={(e) => setCapex(Number(e.target.value))} /></label>
          </div>
          <p style={{ color: "#8ea0b0", fontSize: 10, marginTop: 10 }}>El objetivo de clientes se limita automáticamente a la cartera real de cada país.</p>
        </aside>
      </div>
    </Shell>
  );
}
