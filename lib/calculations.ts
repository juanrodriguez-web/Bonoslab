/**
 * Input parameters for bonus scenario analysis
 */
export type ScenarioInput = {
  price: number;                    // Bonus price (€)
  minutes: number;                  // Minutes included in bonus
  wholesaleCostPerMinute: number;   // Wholesale cost per minute (€/min)
  expectedUsagePct: number;         // Expected usage percentage (%)
  targetCustomers: number;          // Target number of customers
  capex: number;                    // Capital expenditure (€)
};

/**
 * Calculated results for bonus scenario
 */
export type ScenarioResult = {
  expectedMinutes: number;          // expectedMinutes = minutes × (usage% / 100)
  variableCost: number;             // variableCost = expectedMinutes × wholesaleCostPerMinute
  unitMargin: number;               // unitMargin = price - variableCost (€ per bonus)
  marginPct: number;                // marginPct = (unitMargin / price) × 100 (%)
  annualRevenue: number;            // revenue = price × targetCustomers × 12 (€/year)
  annualMargin: number;             // annualMargin = unitMargin × targetCustomers × 12 (€/year)
  breakEvenCustomers: number | null; // breakEvenCustomers = CAPEX / unitMargin (customers)
  paybackMonths: number | null;     // paybackMonths = CAPEX / (unitMargin × targetCustomers)
};

/**
 * Calculate financial metrics for a bonus scenario.
 *
 * Formula reference:
 * - expectedMinutes = minutes × (usage% / 100)
 * - variableCost = expectedMinutes × wholesaleCostPerMinute
 * - unitMargin = price - variableCost
 * - marginPct = (unitMargin / price) × 100
 * - annualRevenue = price × targetCustomers × 12
 * - annualMargin = unitMargin × targetCustomers × 12
 * - breakEvenCustomers = CAPEX / unitMargin (null if unitMargin ≤ 0)
 * - paybackMonths = CAPEX / (unitMargin × targetCustomers) (null if monthly margin ≤ 0)
 *
 * Edge cases:
 * - Division by zero: handled with conditional checks
 * - Negative margin: returns null for break-even and payback
 * - Zero price: marginPct defaults to 0
 */
export type Recommendation = "PRIORIDAD ALTA" | "MANTENER EN ANÁLISIS" | "BACKLOG" | "NO DESARROLLAR";

/**
 * Trazable, rule-based recommendation for a scenario result -- no ML/AI involved.
 *
 * Rules (matching the original BonosLab v1 spec):
 * - unitMargin <= 0                                        -> NO DESARROLLAR
 * - payback <= 12 months AND marginPct >= 45%               -> PRIORIDAD ALTA
 * - payback <= 24 months                                    -> MANTENER EN ANÁLISIS
 * - anything else (margin low, ROI insufficient, payback > 24) -> BACKLOG
 */
/**
 * ROI anual = ((margen_anual - CAPEX) / CAPEX) x 100
 * (return on investment, not a plain margin/capex ratio -- the CAPEX itself
 * must be netted out first, or a break-even year would show 100% instead of 0%.)
 */
export function annualRoi(annualMargin: number, capex: number): number {
  return capex > 0 ? ((annualMargin - capex) / capex) * 100 : 0;
}

export function getRecommendation(result: ScenarioResult): Recommendation {
  if (result.unitMargin <= 0) return "NO DESARROLLAR";
  if (result.paybackMonths !== null && result.paybackMonths <= 12 && result.marginPct >= 45) return "PRIORIDAD ALTA";
  if (result.paybackMonths !== null && result.paybackMonths <= 24) return "MANTENER EN ANÁLISIS";
  return "BACKLOG";
}

/** Best-to-worst order, for sorting a list of scenarios/countries by recommendation. */
export const RECOMMENDATION_ORDER: Recommendation[] = ["PRIORIDAD ALTA", "MANTENER EN ANÁLISIS", "BACKLOG", "NO DESARROLLAR"];

export function recommendationRank(recommendation: Recommendation): number {
  return RECOMMENDATION_ORDER.indexOf(recommendation);
}

export function calculateScenario(input: ScenarioInput): ScenarioResult {
  const expectedMinutes = input.minutes * (input.expectedUsagePct / 100);
  const variableCost = expectedMinutes * input.wholesaleCostPerMinute;
  const unitMargin = input.price - variableCost;
  const marginPct = input.price > 0 ? (unitMargin / input.price) * 100 : 0;
  const annualRevenue = input.price * input.targetCustomers * 12;
  const annualMargin = unitMargin * input.targetCustomers * 12;
  const breakEvenCustomers = unitMargin > 0 ? Math.ceil(input.capex / unitMargin) : null;
  const monthlyMargin = unitMargin * input.targetCustomers;
  const paybackMonths = monthlyMargin > 0 ? input.capex / monthlyMargin : null;

  return {
    expectedMinutes,
    variableCost,
    unitMargin,
    marginPct,
    annualRevenue,
    annualMargin,
    breakEvenCustomers,
    paybackMonths,
  };
}
