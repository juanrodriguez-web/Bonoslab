"use client";

import { useMemo, useState } from "react";
import Shell from "@/components/Shell";
import SliderField from "@/components/SliderField";
import { annualRoi, calculateScenario, getRecommendation } from "@/lib/calculations";
import { countries } from "@/lib/countries";
import { money, number } from "@/lib/format";

export default function SimuladorPage() {
  const [selectedCountry, setSelectedCountry] = useState(countries[0].name);
  const [price, setPrice] = useState(5);
  const [minutes, setMinutes] = useState(100);
  const [usage, setUsage] = useState(42);
  const [wholesale, setWholesale] = useState(0.018);
  const [targetCustomers, setTargetCustomers] = useState(3100);
  const [capex, setCapex] = useState(50000);

  const country = countries.find((c) => c.name === selectedCountry) ?? countries[0];
  const result = useMemo(
    () => calculateScenario({ price, minutes, wholesaleCostPerMinute: wholesale, expectedUsagePct: usage, targetCustomers, capex }),
    [price, minutes, wholesale, usage, targetCustomers, capex]
  );
  const roi = annualRoi(result.annualMargin, capex);
  const recommendation = getRecommendation(result);

  function reset() { setPrice(5); setMinutes(100); setUsage(42); setWholesale(0.018); setTargetCustomers(3100); setCapex(50000); }
  function useCountryBase() { setTargetCustomers(country.customers); }

  return (
    <Shell eyebrow="Simulador" title="Simulador de escenarios" subtitle="Ajusta los parámetros del bono y recalcula márgenes, break-even, payback y ROI en tiempo real.">
      <div className="grid-main">
        <aside className="panel simulator">
          <div className="sim-head"><div><h2>PARÁMETROS <span>ⓘ</span></h2></div><button onClick={reset}>↻ Restablecer</button></div>
          <label className="select-field">País de referencia<select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>{countries.map((c) => <option key={c.name}>{c.name}</option>)}</select></label>
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
          <button type="button" className="wide-ghost" onClick={useCountryBase}>Usar cartera de {country.name} ({number(country.customers)}) como objetivo</button>
        </aside>

        <section className="panel">
          <div className="panel-toolbar"><div className="section-title"><h2>RESULTADO COMPLETO</h2></div></div>
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
          <div className="metric-row bottom">
            <div><span>MINUTOS ESPERADOS</span><b>{result.expectedMinutes.toFixed(1)} min</b></div>
            <div><span>COSTE VARIABLE</span><b>{result.variableCost.toFixed(2)} €</b></div>
            <div><span>CLIENTES OBJETIVO</span><b>{number(targetCustomers)}</b></div>
          </div>
          <div className="recommendation" style={{ marginTop: 14 }}>
            <span>◎</span>
            <div><small>RECOMENDACIÓN AUTOMÁTICA</small><strong>{recommendation}</strong><p>Resultado calculado con reglas trazables.</p></div>
            <b>›</b>
          </div>
        </section>
      </div>
    </Shell>
  );
}
