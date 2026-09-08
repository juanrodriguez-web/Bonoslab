# Productlab Prepago v1.0

Herramienta interna de análisis para evaluar oportunidades de lanzamiento de bonos internacionales de prepago. Permite simular escenarios, visualizar carteras de países y obtener recomendaciones automáticas basadas en reglas trazables.

## 🚀 Quick Start

### Requisitos

- Node.js 18+ 
- npm

### Instalación y ejecución

```bash
npm install
npm run dev
```

Abre `http://localhost:3000` en tu navegador.

### Build para producción

```bash
npm run build
npm start
```

## 📁 Estructura del proyecto

```
app/
  ├── layout.tsx          # Layout raíz con metadatos
  ├── page.tsx            # Página principal (importa Dashboard)
  ├── globals.css         # Estilos globales (diseño Vodafone)
  ├── mercado/page.tsx    # Comparativa de mercado y penetración por país
  ├── portfolio/page.tsx  # Ranking completo y ordenable de los 5 países
  ├── simulador/page.tsx  # Simulador standalone con resultado completo
  ├── decision-lab/page.tsx # Un bono aplicado a los 5 países, ranking por recomendación
  ├── business-case/page.tsx # Caso de negocio detallado de un país (?country=)
  ├── escenarios/page.tsx # Guardar/cargar/borrar escenarios (localStorage)
  ├── informes/page.tsx   # Informe consolidado imprimible
  ├── datos/page.tsx      # Dataset en crudo + estructura de importación futura
  └── administracion/page.tsx # Fórmulas y reglas de recomendación documentadas

components/
  ├── Dashboard.tsx       # Contenido del dashboard principal (cliente)
  ├── Shell.tsx           # Sidebar + topbar compartidos por todas las páginas
  └── SliderField.tsx     # Slider reutilizado en simulador/business-case/decision-lab/informes/escenarios

lib/
  ├── calculations.ts     # Motor de cálculos (tipos + función pura + recomendación)
  ├── countries.ts        # Datos de países (centralizado)
  ├── scenarios.ts        # Persistencia de escenarios en localStorage
  └── format.ts           # Formateadores compartidos (money/number/pct/fecha)
```

## 🎯 Funcionalidades v1

### 1. Dashboard

Muestra KPIs de alto nivel:
- Mercado potencial total
- Clientes Vodafone
- Ingreso potencial anual
- Margen potencial anual
- ROI promedio

### 2. Portfolio de países

Visualiza 5 países prioritarios:
- **República Dominicana** (Prioridad Alta)
- **Marruecos** (Prioridad Alta)
- **Paraguay** (Prioridad Media)
- **Cuba** (Prioridad Media)
- **Senegal** (Prioridad Baja)

Cada país muestra:
- Mercado potencial
- Clientes Vodafone
- Penetración (%)
- Ingreso anual estimado
- Margen anual
- ROI

### 3. Simulador interactivo

Permite variar en tiempo real:

**Parámetros:**
- País seleccionado
- Precio del bono (€)
- Minutos incluidos
- Utilización esperada (%)
- Clientes objetivo
- Coste wholesale (€/min)
- CAPEX (€)

**Resultados calculados:**
- Margen unitario (€)
- Margen porcentual (%)
- Margen anual (€)
- Payback (meses)
- Break-even (clientes)
- ROI anual (%)

### 4. Recomendación automática

Reglas trazables (sin IA):

| Escenario | Criterio | Recomendación |
|-----------|----------|----------------|
| Inviable | Margen unitario ≤ 0 | NO DESARROLLAR |
| Altamente viable | Margen ≥ 45% Y Payback ≤ 12 meses | PRIORIDAD ALTA |
| Viable | Payback ≤ 24 meses | MANTENER EN ANÁLISIS |
| Déficit de retorno | Otros casos | BACKLOG |

## 📐 Fórmulas implementadas

Todas definidas en `lib/calculations.ts`:

```
Minutos esperados = minutos_incluidos × (utilización_esperada / 100)

Coste variable unitario = minutos_esperados × coste_wholesale_por_minuto

Margen unitario (€) = precio_bono - coste_variable_unitario

Margen porcentual = (margen_unitario / precio_bono) × 100

Margen anual = margen_unitario × clientes_objetivo × 12

Break-even (clientes) = CAPEX / margen_unitario  (si margen_unitario > 0)

Payback (meses) = CAPEX / (margen_unitario × clientes_objetivo)

ROI anual = ((margen_anual - CAPEX) / CAPEX) × 100
```

**Gestión de casos edge:**
- División por cero: controlada
- Margen negativo: detectable
- Payback con margen nulo: retorna `null`

## 🎨 Diseño

Inspirado en Vodafone:
- Fondo azul marino oscuro (#06111c)
- Acentos rojo Vodafone (#e60000)
- Tarjetas con gradientes sutiles
- Tipografía clara (Inter, Segoe UI)
- Responsive para escritorio, tablet y móvil
- Accesibilidad básica (contraste, semántica)

## ✅ Más allá del v1

Implementado sobre la base del v1, usando siempre datos y fórmulas reales (nada hardcodeado ni decorativo):

- **Business Case** (`/business-case?country=`) — caso de negocio completo de un país, con parámetros ajustables.
- **Decision Lab** (`/decision-lab`) — un mismo diseño de bono aplicado a los 5 países, ranking por recomendación.
- **Escenarios** (`/escenarios`) — guardar, cargar y borrar escenarios, persistidos en `localStorage` (sin backend).
- **Simulador** (`/simulador`) — versión standalone con el desglose completo (incluye break-even e ingreso anual).
- **Portfolio** (`/portfolio`) — ranking completo y ordenable de los 5 países.
- **Mercado** (`/mercado`) — comparativa visual de mercado, penetración y consumo OOB.
- **Informes** (`/informes`) — informe consolidado, imprimible/exportable a PDF con `window.print()`.
- **Datos** (`/datos`) — dataset en crudo, más la estructura de importación futura documentada en la propia app.
- **Administración** (`/administracion`) — fórmulas y reglas de recomendación documentadas en la propia app.
- **Análisis de sensibilidad** (Dashboard) — mapa de calor real, ROI vs precio y utilización.

## 🔄 Próximas fases (sin implementar)

### Importación de datos

Estructura esperada para Excel/CSV:

```typescript
type CountryImport = {
  name: string;           // Nombre del país
  code: string;           // Código ISO-2
  market: number;         // Mercado INE
  customers: number;      // Cartera por nacionalidad
  outOfBundle: number;    // Consumo internacional
  score: number;          // Score evaluado (0-100)
  rating: number;         // Rating (1-5 estrellas)
  priority: string;       // "Alta" | "Media" | "Baja"
};
```

Archivos esperados:
- Mercado por país (INE)
- Cartera por nacionalidad (CRM)
- Consumo internacional (facturación)
- Costes wholesale (procurement)

(Estructura y dataset actual también visibles en `/datos` dentro de la propia app.)

## 📊 Datos actuales

Todos los datos son **mock/simulados** para esta v1:

- Basados en mercados reales (estimaciones)
- Propósitos de demostración y pruebas
- **Reemplazar antes de producción**

Ubicación: `lib/countries.ts`

## 🛠 Stack técnico

- **Framework:** Next.js 16+ (App Router)
- **Runtime:** React 19+
- **Lenguaje:** TypeScript
- **Estilos:** CSS puro (sin frameworks)
- **Build:** Turbopack (incluido en Next.js)

**Sin dependencias externas** (mantener simple).

## 📦 Compilación

El proyecto compila sin warnings.

```bash
npm run build     # Compila para producción
npm run dev       # Servidor de desarrollo
npm run lint      # ESLint (si está configurado)
```

## 🚢 Deployment

Compatible con **Vercel**:

1. Push a GitHub
2. Conectar repositorio a Vercel
3. Vercel detecta automáticamente Next.js
4. Deploy automático en push

```bash
git push origin claude/bonoslab-v1
```

## 📝 Notas para el desarrollo futuro

1. **Datos:** Los países están hardcodeados en `lib/countries.ts`. Reemplazar con API/DB.
2. **Autenticación:** No implementada. Añadir si es necesario.
3. **Persistencia:** Los escenarios se resetean al refrescar. Usar localStorage o DB.
4. **Historial:** Guardar simulaciones para auditoría.
5. **Exportación:** PDF o Excel con resultados.

## 📄 License

Interno. Solo para uso corporativo de Vodafone.

---

**Versión:** 1.0.0  
**Última actualización:** 2026-08-05  
**Autor:** Productlab Prepago Team
