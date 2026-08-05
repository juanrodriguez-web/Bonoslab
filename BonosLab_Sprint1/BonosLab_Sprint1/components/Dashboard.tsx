"use client";

import { useMemo, useState } from "react";
import { calculateScenario } from "@/lib/calculations";
import { countries } from "@/lib/countries";

const navItems = [
  ["▦", "Dashboard"], ["◉", "Mercado"], ["▣", "Portfolio"], ["▤", "Business Case"],
  ["▥", "Simulador"], ["✧", "Decision Lab"], ["⌁", "Escenarios"], ["▧", "Informes"],
  ["◫", "Datos"], ["⚙", "Administración"],
];

function money(value: number, digits = 0) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: digits }).format(value);
}
function number(value: number) { return new Intl.NumberFormat("es-ES").format(Math.round(value)); }
function pct(value: number) { return `${value.toFixed(1).replace(".0", "")}%`; }

function Sparkline({ tone = "red" }: { tone?: "red" | "purple" | "cyan" | "green" }) {
  return <svg className={`spark ${tone}`} viewBox="0 0 82 32" aria-hidden="true"><polyline points="2,27 14,20 24,23 35,12 46,18 58,7 69,11 80,2" /></svg>;
}

function SliderField({ label, value, min, max, step, suffix, onChange }: { label: string; value: number; min: number; max: number; step: number; suffix?: string; onChange: (value: number) => void; }) {
  const progress = ((value - min) / (max - min)) * 100;
  return (
    <label className="slider-field">
      <span><b>{label}</b><strong>{number(value)}{suffix ?? ""}</strong></span>
      <input style={{ "--progress": `${progress}%` } as React.CSSProperties} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <small><span>{number(min)}{suffix ?? ""}</span><span>{number(max)}{suffix ?? ""}</span></small>
    </label>
  );
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

  const selected = countries.find((country) => country.name === selectedCountry) ?? countries[0];
  const result = useMemo(() => calculateScenario({ price, minutes, wholesaleCostPerMinute: wholesale, expectedUsagePct: usage, targetCustomers, capex }), [price, minutes, wholesale, usage, targetCustomers, capex]);
  const recommendation = result.unitMargin <= 0 ? "NO DESARROLLAR" : result.paybackMonths !== null && result.paybackMonths <= 12 && result.marginPct >= 45 ? "PRIORIDAD ALTA" : result.paybackMonths !== null && result.paybackMonths <= 24 ? "MANTENER EN ANÁLISIS" : "BACKLOG";

  function reset() { setPrice(5); setMinutes(100); setUsage(42); setWholesale(0.018); setTargetCustomers(3100); setCapex(50000); setTab("params"); }

  return (
    <div className="shell dark-shell">
      <aside className="sidebar">
        <div className="brand-wrap"><div className="vodafone-mark"><span /></div><div><strong><i>Bonos</i>Lab</strong><small>Decision Intelligence</small></div></div>
        <nav>{navItems.map(([icon, item], index) => <a key={item} className={index === 0 ? "active" : ""}><span>{icon}</span>{item}{item === "Decision Lab" && <em>NUEVO</em>}</a>)}</nav>
        <div className="sidebar-spacer" />
        <div className="dataset-card"><div><span>Dataset activo</span><b>2026.08.05-R01</b></div><i className="status-dot" /><hr/><div><span>Última actualización</span><b>05/08/2026 19:18</b></div></div>
        <footer><span>© Vodafone España</span><span>v1.1.0</span></footer>
      </aside>

      <main className="content">
        <header className="topbar">
          <div className="title-block"><p className="eyebrow">Decision Lab · Prepago Internacional</p><h1>Buenos días, Javier <span>👋</span></h1><p>Analiza el mercado, simula escenarios y decide con datos qué bonos merece la pena desarrollar.</p></div>
          <div className="header-actions"><button className="secondary">Vista ejecutiva⌄</button><button className="notification">♧<b>3</b></button><button className="avatar">JR</button></div>
        </header>

        <section className="kpis">
          <article><span>MERCADO POTENCIAL</span><strong>7,42 M <em>↑ 2,3%</em></strong><small>vs. actualización anterior</small><Sparkline tone="red" /></article>
          <article><span>CLIENTES VODAFONE</span><strong>512 K <em>↑ 1,1%</em></strong><small>6,9% penetración media</small><Sparkline tone="purple" /></article>
          <article><span>INGRESO POTENCIAL ANUAL</span><strong>€41,3 M <em>↑ 6,8%</em></strong><small>Con todos los bonos</small><Sparkline tone="cyan" /></article>
          <article><span>MARGEN POTENCIAL ANUAL</span><strong>€24,8 M <em>↑ 4,2%</em></strong><small>60,1% margen promedio</small><Sparkline tone="green" /></article>
          <article><span>ROI PROMEDIO</span><strong className="purple-value">152% <em>↑ 12 pp</em></strong><small>Retorno sobre inversión</small><Sparkline tone="purple" /></article>
        </section>

        <div className="grid-main">
          <section className="panel portfolio">
            <div className="panel-toolbar"><div className="section-title"><h2>PORTFOLIO <span>· TOP PAÍSES POR POTENCIAL</span></h2><i>ⓘ</i></div><div className="toolbar-actions"><div className="segmented"><button className="active">Top 5</button><button>Todos los países</button></div><button className="map-button">◉ Ver en mapa</button></div></div>
            <div className="country-grid">
              {countries.map((country) => {
                const penetration = country.market > 0 ? (country.customers / country.market) * 100 : 0;
                const margin = result.unitMargin * Math.max(country.outOfBundle, 1) * 12;
                const roi = capex > 0 ? (margin / capex) * 100 : 0;
                const active = country.name === selectedCountry;
                return <article key={country.name} className={`country-card ${active ? "selected" : ""}`}>
                  <div className="country-card-head"><span className="flag-box">{country.flag}</span><div><h3>{country.name}</h3><div className="stars">{"★".repeat(country.rating)}<span>{"★".repeat(5-country.rating)}</span></div></div><b className={`score score-${country.priority.toLowerCase()}`}>{country.score}</b></div>
                  <div className="metric-row"><div><span>MERCADO POTENCIAL</span><b>{number(country.market)}</b></div><div><span>CLIENTES VODAFONE</span><b>{number(country.customers)}</b></div><div><span>PENETRACIÓN</span><b>{pct(penetration)}</b></div></div>
                  <div className="metric-row bottom"><div><span>INGRESO ANUAL</span><b>{money(margin / .6)}</b></div><div><span>MARGEN ANUAL</span><b>{money(margin)}</b></div><div><span>ROI</span><b>{roi.toFixed(0)}%</b></div></div>
                  <button onClick={() => setSelectedCountry(country.name)} className={active ? "primary-card" : "ghost-card"}>Analizar país <span>→</span></button>
                </article>;
              })}
              <article className="country-card add-card"><div className="plus">＋</div><b>Añadir a comparación</b><p>Selecciona varios países para comparar escenarios.</p></article>
            </div>
            <div className="portfolio-insight"><span>▥</span><p><b>{selected.name}</b> es el país seleccionado para el análisis. ROI estimado <b>{capex > 0 ? ((result.annualMargin / capex) * 100).toFixed(0) : "0"}%</b> con recuperación de la inversión en <b>{result.paybackMonths?.toFixed(1) ?? "N/A"} meses</b>.</p><button>Ver análisis completo →</button></div>

            <div className="lower-grid">
              <article className="mini-panel sensitivity"><div className="mini-head"><h3>ANÁLISIS DE SENSIBILIDAD</h3><span>ⓘ</span></div><p>ROI según precio y utilización</p><div className="heat-wrap"><span className="axis-y">Utilización</span><div className="heatmap">{Array.from({length: 40}).map((_,i)=><i key={i} style={{"--cell": `${i}`} as React.CSSProperties}/>)}</div><div className="heat-legend"><span>Alto</span><b/><span>Bajo</span></div></div><div className="axis-x"><span>2€</span><span>5€</span><span>10€</span><span>15€</span><span>20€</span></div></article>
              <article className="mini-panel"><div className="mini-head"><h3>ESCENARIOS GUARDADOS</h3><button>Ver todos →</button></div><ul className="compact-list"><li><div><b>Escenario base 5€</b><span>05/08/2026 18:55</span></div><em className="ok">Activo</em></li><li><div><b>Agresivo minutos 200</b><span>05/08/2026 17:42</span></div><em className="warn">Comparar</em></li><li><div><b>Conservador precio 7€</b><span>05/08/2026 16:31</span></div><em className="warn">Comparar</em></li></ul></article>
              <article className="mini-panel"><div className="mini-head"><h3>PRÓXIMAS DECISIONES</h3></div><ul className="decision-list"><li><span>☑</span>Validar supuestos wholesale<em>Pendiente</em></li><li><span>☑</span>Revisar competencia local<em>Pendiente</em></li><li><span>☑</span>Validar capacidad técnica<em className="done">Hecho</em></li><li><span>☑</span>Aprobación comité productos<em>Pendiente</em></li></ul><button className="wide-ghost">Ver plan completo →</button></article>
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
      </main>
    </div>
  );
}
