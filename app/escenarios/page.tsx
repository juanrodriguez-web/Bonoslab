"use client";

import { useEffect, useMemo, useState } from "react";
import Shell from "@/components/Shell";
import SliderField from "@/components/SliderField";
import { calculateScenario, getRecommendation } from "@/lib/calculations";
import { money, relativeDate } from "@/lib/format";
import { deleteScenario, listScenarios, saveScenario, type SavedScenario } from "@/lib/scenarios";

export default function EscenariosPage() {
  const [price, setPrice] = useState(5);
  const [minutes, setMinutes] = useState(100);
  const [usage, setUsage] = useState(42);
  const [wholesale, setWholesale] = useState(0.018);
  const [targetCustomers, setTargetCustomers] = useState(3100);
  const [capex, setCapex] = useState(50000);
  const [name, setName] = useState("");
  const [saved, setSaved] = useState<SavedScenario[]>([]);

  useEffect(() => { setSaved(listScenarios()); }, []);

  const result = useMemo(
    () => calculateScenario({ price, minutes, wholesaleCostPerMinute: wholesale, expectedUsagePct: usage, targetCustomers, capex }),
    [price, minutes, wholesale, usage, targetCustomers, capex]
  );
  const recommendation = getRecommendation(result);

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    saveScenario({ name: trimmed, price, minutes, wholesale, usage, targetCustomers, capex });
    setSaved(listScenarios());
    setName("");
  }

  function handleLoad(s: SavedScenario) {
    setPrice(s.price);
    setMinutes(s.minutes);
    setWholesale(s.wholesale);
    setUsage(s.usage);
    setTargetCustomers(s.targetCustomers);
    setCapex(s.capex);
  }

  function handleDelete(id: string) {
    deleteScenario(id);
    setSaved(listScenarios());
  }

  return (
    <Shell
      eyebrow="Escenarios"
      title="Escenarios guardados"
      subtitle="Guarda combinaciones de parámetros del simulador y vuelve a cargarlas cuando quieras. Se guardan en este navegador, sin servidor ni base de datos."
    >
      <div className="grid-main">
        <section className="panel">
          <div className="panel-toolbar"><div className="section-title"><h2>TUS ESCENARIOS <span>· {saved.length}</span></h2></div></div>
          {saved.length === 0 ? (
            <p style={{ color: "#8ea0b0", fontSize: 12 }}>Todavía no has guardado ningún escenario. Ajusta los parámetros a la derecha, ponle un nombre y pulsa &quot;Guardar escenario&quot;.</p>
          ) : (
            <ul className="compact-list">
              {saved.map((s) => {
                const sResult = calculateScenario({ price: s.price, minutes: s.minutes, wholesaleCostPerMinute: s.wholesale, expectedUsagePct: s.usage, targetCustomers: s.targetCustomers, capex: s.capex });
                return (
                  <li key={s.id}>
                    <div><b>{s.name}</b><span>{relativeDate(s.savedAt)} · {s.price}€ · {s.minutes} min · margen anual {money(sResult.annualMargin)}</span></div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button type="button" onClick={() => handleLoad(s)} className="wide-ghost" style={{ margin: 0, width: "auto", padding: "6px 10px" }}>Cargar</button>
                      <button type="button" onClick={() => handleDelete(s.id)} className="wide-ghost" style={{ margin: 0, width: "auto", padding: "6px 10px", color: "#ff6559" }}>Eliminar</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside className="panel simulator">
          <div className="sim-head"><div><h2>SIMULADOR</h2></div></div>
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
          <div className="results">
            <div><span>MARGEN UNITARIO</span><strong>{result.unitMargin.toFixed(2)} €</strong></div>
            <div><span>MARGEN %</span><strong>{result.marginPct.toFixed(1)}%</strong></div>
            <div><span>MARGEN ANUAL</span><strong>{money(result.annualMargin)}</strong></div>
            <div><span>PAYBACK</span><strong>{result.paybackMonths === null ? "N/A" : `${result.paybackMonths.toFixed(1)} meses`}</strong></div>
          </div>
          <div className="recommendation">
            <span>◎</span>
            <div><small>RECOMENDACIÓN AUTOMÁTICA</small><strong>{recommendation}</strong><p>Resultado calculado con reglas trazables.</p></div>
            <b>›</b>
          </div>
          <div className="control-grid" style={{ gridTemplateColumns: "1fr", marginTop: 12 }}>
            <label>NOMBRE DEL ESCENARIO
              <input type="text" placeholder="p. ej. Agresivo minutos 200" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSave()} />
            </label>
          </div>
          <button type="button" className="wide-ghost" onClick={handleSave} disabled={!name.trim()}>💾 Guardar escenario</button>
        </aside>
      </div>
    </Shell>
  );
}
