"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { annualRoi, calculateScenario, getRecommendation, recommendationRank } from "@/lib/calculations";
import { countries } from "@/lib/countries";
import { listScenarios, type SavedScenario } from "@/lib/scenarios";
import { money, number, pct, relativeDate } from "@/lib/format";
import Shell from "@/components/Shell";
import SliderField from "@/components/SliderField";

function Sparkline({ tone = "red" }: { tone?: "red" | "purple" | "cyan" | "green" }) {
  return <svg className={`spark ${tone}`} viewBox="0 0 82 32" aria-hidden="true"><polyline points="2,27 14,20 24,23 35,12 46,18 58,7 69,11 80,2" /></svg>;
}

export default function Dashboard() {
  const [selectedCountry, setSelectedCountry] = useState(countries[0].name);
  const [tab, setTab] = useState<"params" | "results">("params");
  const [price, setPrice] = useState(5);
  const [minutes, setMinutes] = useState(100);
  const [usage, setUsage] = useState(42);
  const [wholesale, setWholesale] = useState(0.018);
  const [targetCustomers, setTargetCustomers] = useState(3100);
  const [capex, setCapex] = useState(50000);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [showComparePicker, setShowComparePicker] = useState(false);
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);

  useEffect(() => { setSavedScenarios(listScenarios()); }, []);

  const selected = countries.find((country) => country.name === selectedCountry) ?? countries[0];
  const result = useMemo(() => calculateScenario({ price, minutes, wholesaleCostPerMinute: wholesale, expectedUsagePct: usage, targetCustomers, capex }), [price, minutes, wholesale, usage, targetCustomers, capex]);
  const recommendation = getRecommendation(result);

  // Same bond design (price/minutes/usage/wholesale/capex) rolled out to each
  // country's full current customer base -- an upper-bound portfolio view,
  // independent of the "Clientes objetivo" slider used for the single
  // selected country above.
  const countryResults = useMemo(
    () => countries.map((country) => ({
      country,
      penetration: country.market > 0 ? (country.customers / country.market) * 100 : 0,
      // "Clientes objetivo" can't exceed a country's real customer base.
      scenario: calculateScenario({ price, minutes, wholesaleCostPerMinute: wholesale, expectedUsagePct: usage, targetCustomers: Math.min(targetCustomers, country.customers), capex }),
    })),
    [price, minutes, wholesale, usage, targetCustomers, capex]
  );
  function countryRoi(scenario: ReturnType<typeof calculateScenario>) {
    return annualRoi(scenario.annualMargin, capex);
  }
  const totalMarket = countries.reduce((sum, c) => sum + c.market, 0);
  const totalCustomers = countries.reduce((sum, c) => sum + c.customers, 0);
  const totalRevenue = countryResults.reduce((sum, r) => sum + r.scenario.annualRevenue, 0);
  const totalMargin = countryResults.reduce((sum, r) => sum + r.scenario.annualMargin, 0);
  const avgMarginPct = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;
  const avgRoi = countryResults.length > 0 ? countryResults.reduce((sum, r) => sum + countryRoi(r.scenario), 0) / countryResults.length : 0;
  const SENSITIVITY_PRICES = [1, 3, 5, 7, 9, 11, 13, 15, 17, 20];
  const SENSITIVITY_USAGE = [90, 65, 40, 15];
  const sensitivityCells = useMemo(
    () => SENSITIVITY_USAGE.flatMap((sensUsage) => SENSITIVITY_PRICES.map((sensPrice) => {
      const scenario = calculateScenario({ price: sensPrice, minutes, wholesaleCostPerMinute: wholesale, expectedUsagePct: sensUsage, targetCustomers, capex });
      const roi = annualRoi(scenario.annualMargin, capex);
      return { price: sensPrice, usage: sensUsage, roi };
    })),
    [minutes, wholesale, targetCustomers, capex]
  );
  function roiColor(roi: number) {
    const t = Math.max(0, Math.min(1, (roi + 50) / 300));
    return `hsl(${(t * 140).toFixed(0)}, 80%, 45%)`;
  }
  const rankedCountries = useMemo(
    () => [...countryResults]
      .map((r) => ({ ...r, recommendation: getRecommendation(r.scenario), roi: countryRoi(r.scenario) }))
      .sort((a, b) => recommendationRank(a.recommendation) - recommendationRank(b.recommendation) || b.roi - a.roi),
    [countryResults]
  );

  function reset() { setPrice(5); setMinutes(100); setUsage(42); setWholesale(0.018); setTargetCustomers(3100); setCapex(50000); setTab("params"); }
  function toggleCompare(name: string) {
    setCompareList((list) => (list.includes(name) ? list.filter((n) => n !== name) : [...list, name]));
  }

  return (
    <Shell
      eyebrow="Decision Lab · Prepago Internacional"
      title={<>Buenos días, Javier <span>👋</span></>}
      subtitle="Analiza el mercado, simula escenarios y decide con datos qué bonos merece la pena desarrollar."
    >
        <section className="kpis">
          <article><span>MERCADO POTENCIAL</span><strong>{number(totalMarket)}</strong><small>{countries.length} países en cartera</small><Sparkline tone="red" /></article>
          <article><span>CLIENTES VODAFONE</span><strong>{number(totalCustomers)}</strong><small>{pct(totalMarket > 0 ? (totalCustomers / totalMarket) * 100 : 0)} penetración media</small><Sparkline tone="purple" /></article>
          <article><span>INGRESO POTENCIAL ANUAL</span><strong>{money(totalRevenue)}</strong><small>Con el escenario actual del simulador</small><Sparkline tone="cyan" /></article>
          <article><span>MARGEN POTENCIAL ANUAL</span><strong>{money(totalMargin)}</strong><small>{pct(avgMarginPct)} margen promedio</small><Sparkline tone="green" /></article>
          <article><span>ROI PROMEDIO</span><strong className="purple-value">{avgRoi.toFixed(0)}%</strong><small>Retorno sobre inversión</small><Sparkline tone="purple" /></article>
        </section>

        <div className="grid-main">
          <section className="panel portfolio">
            <div className="panel-toolbar"><div className="section-title"><h2>PORTFOLIO <span>· TOP PAÍSES POR POTENCIAL</span></h2><i>ⓘ</i></div><div className="toolbar-actions"><div className="segmented"><button className="active">Top 5</button><Link href="/portfolio">Todos los países</Link></div><button className="map-button" disabled title="Próximamente">◉ Ver en mapa</button></div></div>
            <div className="country-grid">
              {countryResults.map(({ country, penetration, scenario }) => {
                const roi = countryRoi(scenario);
                const active = country.name === selectedCountry;
                return <article key={country.name} className={`country-card ${active ? "selected" : ""}`}>
                  <div className="country-card-head"><span className="flag-box">{country.flag}</span><div><h3>{country.name}</h3><div className="stars">{"★".repeat(country.rating)}<span>{"★".repeat(5-country.rating)}</span></div></div><b className={`score score-${country.priority.toLowerCase()}`}>{country.score}</b></div>
                  <div className="metric-row"><div><span>MERCADO POTENCIAL</span><b>{number(country.market)}</b></div><div><span>CLIENTES VODAFONE</span><b>{number(country.customers)}</b></div><div><span>PENETRACIÓN</span><b>{pct(penetration)}</b></div></div>
                  <div className="metric-row bottom"><div><span>INGRESO ANUAL</span><b>{money(scenario.annualRevenue)}</b></div><div><span>MARGEN ANUAL</span><b>{money(scenario.annualMargin)}</b></div><div><span>ROI</span><b>{roi.toFixed(0)}%</b></div></div>
                  <button onClick={() => setSelectedCountry(country.name)} className={active ? "primary-card" : "ghost-card"}>Analizar país <span>→</span></button>
                </article>;
              })}
              <article className="country-card add-card">
                {showComparePicker ? (
                  <div className="compare-picker">
                    <b>Selecciona países</b>
                    <ul>
                      {countries.map((country) => (
                        <li key={country.name}>
                          <label>
                            <input type="checkbox" checked={compareList.includes(country.name)} onChange={() => toggleCompare(country.name)} />
                            {country.flag} {country.name}
                          </label>
                        </li>
                      ))}
                    </ul>
                    <button type="button" onClick={() => setShowComparePicker(false)}>Listo</button>
                  </div>
                ) : (
                  <button type="button" className="add-card-trigger" onClick={() => setShowComparePicker(true)}>
                    <div className="plus">＋</div>
                    <b>Añadir a comparación</b>
                    <p>Selecciona varios países para comparar escenarios.</p>
                  </button>
                )}
              </article>
            </div>
            {compareList.length > 0 && (
              <div className="compare-table-wrap">
                <div className="compare-table-head"><h3>COMPARATIVA DE ESCENARIOS · {compareList.length} {compareList.length === 1 ? "país" : "países"}</h3><button type="button" onClick={() => setCompareList([])}>Limpiar comparación</button></div>
                <table className="compare-table">
                  <thead>
                    <tr>
                      <th>Métrica</th>
                      {compareList.map((name) => (
                        <th key={name}>{countries.find((c) => c.name === name)?.flag} {name}<button type="button" aria-label={`Quitar ${name}`} onClick={() => toggleCompare(name)}>×</button></th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>Mercado potencial</td>{compareList.map((name) => <td key={name}>{number(countries.find((c) => c.name === name)!.market)}</td>)}</tr>
                    <tr><td>Clientes Vodafone</td>{compareList.map((name) => <td key={name}>{number(countries.find((c) => c.name === name)!.customers)}</td>)}</tr>
                    <tr><td>Penetración</td>{compareList.map((name) => <td key={name}>{pct(countryResults.find((r) => r.country.name === name)!.penetration)}</td>)}</tr>
                    <tr><td>Ingreso anual</td>{compareList.map((name) => <td key={name}>{money(countryResults.find((r) => r.country.name === name)!.scenario.annualRevenue)}</td>)}</tr>
                    <tr><td>Margen anual</td>{compareList.map((name) => <td key={name}>{money(countryResults.find((r) => r.country.name === name)!.scenario.annualMargin)}</td>)}</tr>
                    <tr><td>ROI</td>{compareList.map((name) => <td key={name}>{countryRoi(countryResults.find((r) => r.country.name === name)!.scenario).toFixed(0)}%</td>)}</tr>
                    <tr><td>Score</td>{compareList.map((name) => <td key={name}>{countries.find((c) => c.name === name)!.score}</td>)}</tr>
                    <tr><td>Prioridad</td>{compareList.map((name) => <td key={name}>{countries.find((c) => c.name === name)!.priority}</td>)}</tr>
                  </tbody>
                </table>
              </div>
            )}
            <div className="portfolio-insight"><span>▥</span><p><b>{selected.name}</b> es el país seleccionado para el análisis. ROI estimado <b>{annualRoi(result.annualMargin, capex).toFixed(0)}%</b> con recuperación de la inversión en <b>{result.paybackMonths?.toFixed(1) ?? "N/A"} meses</b>.</p><Link href={`/business-case?country=${encodeURIComponent(selected.name)}`}>Ver análisis completo →</Link></div>

            <div className="lower-grid">
              <article className="mini-panel sensitivity">
                <div className="mini-head"><h3>ANÁLISIS DE SENSIBILIDAD</h3><span>ⓘ</span></div>
                <p>ROI según precio y utilización, con el resto de parámetros del simulador fijos</p>
                <div className="heat-wrap">
                  <span className="axis-y">Utilización</span>
                  <div className="heatmap">{sensitivityCells.map((cell) => <i key={`${cell.price}-${cell.usage}`} style={{ background: roiColor(cell.roi) }} title={`${cell.price}€ · ${cell.usage}% utilización → ROI ${cell.roi.toFixed(0)}%`} />)}</div>
                  <div className="heat-legend"><span>Alto</span><b/><span>Bajo</span></div>
                </div>
                <div className="axis-x">{SENSITIVITY_PRICES.filter((_, i) => i % 2 === 0).map((p) => <span key={p}>{p}€</span>)}</div>
              </article>
              <article className="mini-panel">
                <div className="mini-head"><h3>ESCENARIOS GUARDADOS</h3><Link href="/escenarios">Ver todos →</Link></div>
                {savedScenarios.length === 0 ? (
                  <p>Todavía no has guardado ningún escenario. Ajusta el simulador y guárdalo desde <Link href="/escenarios">Escenarios</Link>.</p>
                ) : (
                  <ul className="compact-list">
                    {savedScenarios.slice(0, 3).map((s) => (
                      <li key={s.id}><div><b>{s.name}</b><span>{relativeDate(s.savedAt)}</span></div><em className="warn">{s.price}€</em></li>
                    ))}
                  </ul>
                )}
              </article>
              <article className="mini-panel">
                <div className="mini-head"><h3>RECOMENDACIÓN POR PAÍS</h3></div>
                <ul className="decision-list">
                  {rankedCountries.slice(0, 4).map((r) => (
                    <li key={r.country.name}><span>{r.country.flag}</span>{r.country.name}<em className={r.recommendation === "PRIORIDAD ALTA" ? "done" : undefined}>{r.recommendation}</em></li>
                  ))}
                </ul>
                <Link href="/decision-lab" className="wide-ghost">Ver ranking completo →</Link>
              </article>
            </div>
          </section>

          <aside className="panel simulator">
            <div className="sim-head"><div><h2>SIMULADOR DE BONO <span>ⓘ</span></h2></div><button onClick={reset}>↻ Restablecer</button></div>
            <label className="select-field">País seleccionado<select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>{countries.map(c => <option key={c.name}>{c.name}</option>)}</select></label>
            <div className="sim-tabs"><button onClick={()=>setTab("params")} className={tab === "params" ? "active" : ""}>Parámetros</button><button onClick={()=>setTab("results")} className={tab === "results" ? "active" : ""}>Resultados</button></div>
            {tab === "params" ? <>
              <div className="slider-stack"><SliderField label="PRECIO DEL BONO" value={price} min={1} max={20} step={0.5} suffix=" €" onChange={setPrice}/><SliderField label="MINUTOS INCLUIDOS" value={minutes} min={0} max={500} step={10} onChange={setMinutes}/><SliderField label="UTILIZACIÓN ESPERADA" value={usage} min={10} max={100} step={1} suffix="%" onChange={setUsage}/><SliderField label="CLIENTES OBJETIVO" value={targetCustomers} min={100} max={50000} step={100} onChange={setTargetCustomers}/></div>
              <div className="control-grid"><label>WHOLESALE €/MIN<input type="number" step="0.001" min="0" value={wholesale} onChange={(e) => setWholesale(Number(e.target.value))}/></label><label>CAPEX (€)<input type="number" min="0" value={capex} onChange={(e) => setCapex(Number(e.target.value))}/></label></div>
            </> : <div className="result-summary"><h3>Resultado del escenario</h3><p>Con las hipótesis actuales, el escenario genera {money(result.annualMargin)} de margen anual y recupera la inversión en {result.paybackMonths?.toFixed(1) ?? "N/A"} meses.</p></div>}
            <div className="results"><div><span>MARGEN UNITARIO</span><strong>{result.unitMargin.toFixed(2)} €</strong></div><div><span>MARGEN %</span><strong>{result.marginPct.toFixed(1)}%</strong></div><div><span>MARGEN ANUAL</span><strong>{money(result.annualMargin)}</strong></div><div><span>PAYBACK</span><strong>{result.paybackMonths === null ? "N/A" : `${result.paybackMonths.toFixed(1)} meses`}</strong></div></div>
            <div className="recommendation"><span>◎</span><div><small>RECOMENDACIÓN AUTOMÁTICA</small><strong>{recommendation}</strong><p>Resultado calculado con reglas trazables de IA.</p></div><b>›</b></div>
          </aside>
        </div>
    </Shell>
  );
}
