"use client";

import Shell from "@/components/Shell";
import { countries } from "@/lib/countries";

const FORMULAS = [
  ["Minutos esperados", "minutos_incluidos × (utilización_esperada / 100)"],
  ["Coste variable unitario", "minutos_esperados × coste_wholesale_por_minuto"],
  ["Margen unitario (€)", "precio_bono − coste_variable_unitario"],
  ["Margen porcentual", "(margen_unitario / precio_bono) × 100"],
  ["Ingreso anual", "precio_bono × clientes_objetivo × 12"],
  ["Margen anual", "margen_unitario × clientes_objetivo × 12"],
  ["Break-even (clientes)", "CAPEX / margen_unitario  (si margen_unitario > 0)"],
  ["Payback (meses)", "CAPEX / (margen_unitario × clientes_objetivo)"],
  ["ROI anual", "(margen_anual / CAPEX) × 100"],
];

const RULES = [
  ["No viable", "Margen unitario ≤ 0", "NO DESARROLLAR"],
  ["Altamente viable", "Payback ≤ 12 meses y margen ≥ 45%", "PRIORIDAD ALTA"],
  ["Viable", "Payback ≤ 24 meses", "MANTENER EN ANÁLISIS"],
  ["Déficit de retorno", "Cualquier otro caso", "BACKLOG"],
];

export default function AdministracionPage() {
  return (
    <Shell eyebrow="Administración" title="Configuración y referencia" subtitle="Sin autenticación ni roles en esta versión, por diseño. Aquí documentamos cómo calcula la herramienta.">
      <section className="panel">
        <div className="panel-toolbar"><div className="section-title"><h2>FÓRMULAS DEL SIMULADOR <span>· lib/calculations.ts</span></h2></div></div>
        <div style={{ overflowX: "auto" }}>
          <table className="compare-table">
            <thead><tr><th>Métrica</th><th>Fórmula</th></tr></thead>
            <tbody>
              {FORMULAS.map(([label, formula]) => <tr key={label}><td>{label}</td><td style={{ fontFamily: "monospace" }}>{formula}</td></tr>)}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 14 }}>
        <div className="panel-toolbar"><div className="section-title"><h2>REGLAS DE RECOMENDACIÓN <span>· sin IA, trazables</span></h2></div></div>
        <div style={{ overflowX: "auto" }}>
          <table className="compare-table">
            <thead><tr><th>Escenario</th><th>Criterio</th><th>Recomendación</th></tr></thead>
            <tbody>
              {RULES.map(([scenario, criteria, rec]) => <tr key={scenario}><td>{scenario}</td><td>{criteria}</td><td>{rec}</td></tr>)}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 14 }}>
        <div className="panel-toolbar"><div className="section-title"><h2>DATASET</h2></div></div>
        <div className="metric-row bottom">
          <div><span>PAÍSES EN CARTERA</span><b>{countries.length}</b></div>
          <div><span>ORIGEN</span><b>lib/countries.ts (mock)</b></div>
          <div><span>PERSISTENCIA DE ESCENARIOS</span><b>localStorage del navegador</b></div>
        </div>
        <p style={{ color: "#8ea0b0", fontSize: 11, marginTop: 12 }}>
          Sin base de datos ni backend, sin autenticación de usuarios — por decisión de diseño del proyecto (v1 simple, sin sobrearquitectura).
        </p>
      </section>
    </Shell>
  );
}
