"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Shell from "@/components/Shell";
import SliderField from "@/components/SliderField";
import { annualRoi, calculateScenario, getRecommendation } from "@/lib/calculations";
import { countries } from "@/lib/countries";
import { money, number, pct } from "@/lib/format";

function BusinessCaseContent() {
  const searchParams = useSearchParams();
  const initialCountry = searchParams.get("country");
  const [selectedCountry, setSelectedCountry] = useState(
    countries.find((c) => c.name === initialCountry)?.name ?? countries[0].name
  );
  const [price, setPrice] = useState(5);
  const [minutes, setMinutes] = useState(100);
  const [usage, setUsage] = useState(42);
  const [wholesale, setWholesale] = useState(0.018);
  const [targetCustomers, setTargetCustomers] = useState(3100);
  const [capex, setCapex] = useState(50000);

  const country = countries.find((c) => c.name === selectedCountry) ?? countries[0];
  const penetration = country.market > 0 ? (country.customers / country.market) * 100 : 0;
  // "Clientes objetivo" can't exceed the country's real customer base.
  const cappedTarget = Math.min(targetCustomers, country.customers);
  const result = useMemo(
    () => calculateScenario({ price, minutes, wholesaleCostPerMinute: wholesale, expectedUsagePct: usage, targetCustomers: cappedTarget, capex }),
    [price, minutes, wholesale, usage, cappedTarget, capex]
  );
  const roi = annualRoi(result.annualMargin, capex);
  const recommendation = getRecommendation(result);

  return (
    <Shell
      eyebrow="Business Case"
      title={`Caso de negocio · ${country.flag} ${country.name}`}
      subtitle="Proyección completa de lanzar este bono aplicado a la cartera de clientes actual del país."
    >
      <div className="grid-main">
        <section className="panel">
          <div className="panel-toolbar"><div className="section-title"><h2>DATOS DEL PAÍS</h2></div></div>
          <label className="select-field">País<select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>{countries.map((c) => <option key={c.name}>{c.name}</option>)}</select></label>
          <div className="metric-row" style={{ marginTop: 14 }}>
            <div><span>MERCADO POTENCIAL</span><b>{number(country.market)}</b></div>
            <div><span>CLIENTES VODAFONE</span><b>{number(country.customers)}</b></div>
            <div><span>PENETRACIÓN</span><b>{pct(penetration)}</b></div>
          </div>
          <div className="metric-row bottom">
            <div><span>SCORE</span><b>{country.score}</b></div>
            <div><span>PRIORIDAD</span><b>{country.priority}</b></div>
            <div><span>RATING</span><b>{country.rating}/5</b></div>
          </div>

          <div className="panel-toolbar" style={{ marginTop: 18 }}><div className="section-title"><h2>RESULTADO DEL ESCENARIO</h2></div></div>
          <div className="results">
            <div><span>MARGEN UNITARIO</span><strong>{result.unitMargin.toFixed(2)} €</strong></div>
            <div><span>MARGEN %</span><strong>{result.marginPct.toFixed(1)}%</strong></div>
            <div><span>MARGEN ANUAL</span><strong>{money(result.annualMargin)}</strong></div>
            <div><span>PAYBACK</span><strong>{result.paybackMonths === null ? "N/A" : `${result.paybackMonths.toFixed(1)} meses`}</strong></div>
          </div>
          <div className="metric-row bottom">
            <div><span>INGRESO ANUAL</span><b>{money(result.annualRevenue)}</b></div>
            <div><span>BREAK-EVEN</span><b>{result.breakEvenCustomers === null ? "N/A" : `${number(result.breakEvenCustomers)} clientes`}</b></div>
            <div><span>ROI ANUAL</span><b>{roi.toFixed(0)}%</b></div>
          </div>

          <div className="recommendation" style={{ marginTop: 14 }}>
            <span>◎</span>
            <div><small>RECOMENDACIÓN AUTOMÁTICA</small><strong>{recommendation}</strong><p>Aplicando este bono a {number(cappedTarget)} clientes objetivo de los {number(country.customers)} de {country.name}.</p></div>
            <b>›</b>
          </div>
        </section>

        <aside className="panel simulator">
          <div className="sim-head"><div><h2>PARÁMETROS DEL BONO</h2></div></div>
          <div className="slider-stack">
            <SliderField label="PRECIO DEL BONO" value={price} min={1} max={20} step={0.5} suffix=" €" onChange={setPrice} />
            <SliderField label="MINUTOS INCLUIDOS" value={minutes} min={0} max={500} step={10} onChange={setMinutes} />
            <SliderField label="UTILIZACIÓN ESPERADA" value={usage} min={10} max={100} step={1} suffix="%" onChange={setUsage} />
            <SliderField label="CLIENTES OBJETIVO" value={targetCustomers} min={100} max={Math.max(country.customers, 100)} step={100} onChange={setTargetCustomers} />
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

export default function BusinessCasePage() {
  return (
    <Suspense fallback={null}>
      <BusinessCaseContent />
    </Suspense>
  );
}
