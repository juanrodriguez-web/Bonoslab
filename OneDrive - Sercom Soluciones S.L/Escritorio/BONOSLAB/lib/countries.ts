export type Country = {
  name: string;
  code: string;
  flag: string;
  market: number;
  customers: number;
  outOfBundle: number;
  score: number;
  rating: number;
  priority: "Alta" | "Media" | "Baja";
};

export const countries: Country[] = [
  {
    name: "Rep. Dominicana",
    code: "DO",
    flag: "🇩🇴",
    market: 207135,
    customers: 2068,
    outOfBundle: 5200,
    score: 91,
    rating: 5,
    priority: "Alta",
  },
  {
    name: "Marruecos",
    code: "MA",
    flag: "🇲🇦",
    market: 1165955,
    customers: 319506,
    outOfBundle: 11400,
    score: 88,
    rating: 5,
    priority: "Alta",
  },
  {
    name: "Paraguay",
    code: "PY",
    flag: "🇵🇾",
    market: 162633,
    customers: 31402,
    outOfBundle: 1800,
    score: 74,
    rating: 4,
    priority: "Media",
  },
  {
    name: "Cuba",
    code: "CU",
    flag: "🇨🇺",
    market: 252290,
    customers: 6932,
    outOfBundle: 2100,
    score: 66,
    rating: 3,
    priority: "Media",
  },
  {
    name: "Senegal",
    code: "SN",
    flag: "🇸🇳",
    market: 109523,
    customers: 23979,
    outOfBundle: 950,
    score: 58,
    rating: 3,
    priority: "Baja",
  },
];
