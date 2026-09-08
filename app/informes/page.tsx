"use client";

import { useMemo, useState } from "react";
import Shell from "@/components/Shell";
import SliderField from "@/components/SliderField";
import { annualRoi, calculateScenario, getRecommendation } from "@/lib/calculations";
import { countries } from "@/lib/countries";
import { money, number } from "@/lib/format";

export default function InformesPage() {
  const [price, setPrice] = useState(5);
  const [minutes, setMinutes] = useState(100);
  const [usage, setUsage] = useState(42);
  const [wholesale, setWholesale] = useState(0.018);
  const [targetCustomers, setTargetCustomers] = useState(3100);
  const [capex, setCapex] = useState(50000);

  const rows = useMemo(
    () => countries.map((country) => {
      // "Clientes objetivo" can't exceed each country's real customer base.
      const scenario = calculateScenario({ price, minutes, wholesaleCostPerMinute: wholesale, expectedUsagePct: usage, targetCustomers: Math.min(targetCustomers, country.customers), capex });
      const roi = annualRoi(scenario.annualMargin, capex);
      return { country, scenario, roi, recommendation: getRecommendation(scenario) };
    }),
    [price, minutes, usage, wholesale, targetCustomers, capex]
  );
  const totalMargin = rows.reduce((sum, r) => sum + r.scenario.annualMargin, 0);
  const totalRevenue = rows.reduce((sum, r) => sum + r.scenario.annualRevenue, 0);

  return (
    <Shell eyebrow="Informes" title="Informe consolidado" subtitle="Resumen imprimible del escenario actual aplicado a toda la cartera de países.">
      <div className="grid-main print-hide-simulator">
        <section className="panel" id="informe-imprimible">
          <div className="panel-toolbar">
            <div className="section-title"><h2>INFORME · {new Date().toLocaleDateString("es-ES")}</h2></div>
            <button type="button" className="map-button" onClick={() => window.print()}>🖨 Imprimir / Exportar PDF</button>
          </div>

          <div className="metric-row bottom">
            <div><span>PAÍSES ANALIZADOS</span><b>{countries.length}</b></div>
            <div><span>INGRESO ANUAL TOTAL</span><b>{money(totalRevenue)}</b></div>
            <div><span>MARGEN ANUAL TOTAL</span><b>{money(totalMargin)}</b></div>
          </div>

          <div style={{ overflowX: "auto", marginTop: 14 }}>
            <table className="compare-table">
              <thead>
                <tr><th>País</th><th>Mercado</th><th>Clientes</th><th>Margen anual</th><th>Payback</th><th>ROI</th><th>Recomendación</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.country.name}>
                    <td>{r.country.flag} {r.country.name}</td>
                    <td>{number(r.country.market)}</td>
                    <td>{number(r.country.customers)}</td>
                    <td>{money(r.scenario.annualMargin)}</td>
                    <td>{r.scenario.paybackMonths === null ? "N/A" : `${r.scenario.paybackMonths.toFixed(1)} meses`}</td>
                    <td>{r.roi.toFixed(0)}%</td>
                    <td>{r.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="panel simulator no-print">
          <div className="sim-head"><div><h2>PARÁMETROS DEL INFORME</h2></div></div>
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
        </aside>
      </div>
    </Shell>
  );
}
