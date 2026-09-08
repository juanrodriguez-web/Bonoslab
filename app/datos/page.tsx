"use client";

import Shell from "@/components/Shell";
import { countries } from "@/lib/countries";
import { number } from "@/lib/format";

export default function DatosPage() {
  return (
    <Shell eyebrow="Datos" title="Dataset" subtitle="Origen y estructura de los datos que usa Productlab Prepago.">
      <section className="panel">
        <div className="panel-toolbar"><div className="section-title"><h2>DATASET ACTIVO <span>· lib/countries.ts</span></h2></div></div>
        <p style={{ color: "#8ea0b0", fontSize: 12, marginTop: 0 }}>
          Datos mock centralizados en un único fichero (<code>lib/countries.ts</code>), tal y como pedía el brief de v1.
          Todavía no hay importación de Excel/CSV — es la fase 2 documentada más abajo.
        </p>
        <div style={{ overflowX: "auto" }}>
          <table className="compare-table">
            <thead>
              <tr><th>País</th><th>Código</th><th>Mercado</th><th>Clientes</th><th>OOB (min totales)</th><th>OOB min/línea</th><th>Score</th><th>Rating</th><th>Prioridad</th></tr>
            </thead>
            <tbody>
              {countries.map((c) => (
                <tr key={c.name}>
                  <td>{c.flag} {c.name}</td>
                  <td>{c.code}</td>
                  <td>{number(c.market)}</td>
                  <td>{number(c.customers)}</td>
                  <td>{number(c.outOfBundle)}</td>
                  <td>{c.oobMinutesPerLine}</td>
                  <td>{c.score}</td>
                  <td>{c.rating}/5</td>
                  <td>{c.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 14 }}>
        <div className="panel-toolbar"><div className="section-title"><h2>FASE 2 · IMPORTACIÓN DESDE EXCEL/CSV</h2></div></div>
        <p style={{ color: "#8ea0b0", fontSize: 12 }}>Estructura mínima esperada para cargar países desde un fichero externo:</p>
        <pre style={{ background: "#081521", border: "1px solid #2b3d4c", borderRadius: 6, padding: 14, fontSize: 11, color: "#c7d0d8", overflowX: "auto" }}>
{`type CountryImport = {
  name: string;           // Nombre del país
  code: string;           // Código ISO-2
  market: number;         // Mercado INE
  customers: number;      // Cartera por nacionalidad
  outOfBundle: number;    // Consumo internacional
  score: number;          // Score evaluado (0-100)
  rating: number;         // Rating (1-5 estrellas)
  priority: string;       // "Alta" | "Media" | "Baja"
};`}
        </pre>
        <p style={{ color: "#8ea0b0", fontSize: 12 }}>Ficheros de origen esperados: mercado por país (INE), cartera por nacionalidad (CRM), consumo internacional (facturación), costes wholesale (procurement).</p>
      </section>
    </Shell>
  );
}
