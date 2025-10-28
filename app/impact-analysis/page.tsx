"use client";

import React, { Fragment, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronDown, TrendingUp, ArrowUp, Shield, Coins } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from "recharts";
import { fetchRecommendations, type Recommendation } from "@/lib/api";

type KpiKey =
  | "earningsBeat"
  | "priceMomentum"
  | "analystUpgrade"
  | "dividendCut"
  | "targetPrice";

// -----------------------------------------------------------------------------
// Recommendations are now fetched from the backend
// -----------------------------------------------------------------------------

type FeatureRow = {
  title: string;
  subcategories: string[];
  negative: number; // percentage impact decreasing KPI
  positive: number; // percentage impact increasing KPI
  negativeLabel: string;
  positiveLabel: string;
};

// Static dummy data. In a real app, fetch based on ticker and KPI.
const DUMMY_DATA: Record<KpiKey, Array<FeatureRow>> = {
  earningsBeat: [
    {
      title: "Valuation Metrics",
      subcategories: ["P/E", "EV/EBITDA", "P/B", "PEG"],
      negative: 1.2,
      positive: 0.6,
      negativeLabel: "High valuation compressed odds",
      positiveLabel: "Reasonable PEG supported odds",
    },
    {
      title: "Growth Metrics",
      subcategories: [
        "EPS growth YoY",
        "Revenue growth",
        "Free Cash Flow growth",
      ],
      negative: 0.4,
      positive: 2.1,
      negativeLabel: "Mixed FCF trend",
      positiveLabel: "Strong EPS growth lifted odds",
    },
    {
      title: "Profitability Ratios",
      subcategories: ["ROE", "ROA", "Operating margin", "Net margin"],
      negative: 0.3,
      positive: 1.0,
      negativeLabel: "Margin pressure",
      positiveLabel: "ROE resilience",
    },
    {
      title: "Leverage & Solvency",
      subcategories: [
        "Debt/Equity",
        "Interest coverage",
        "Cash ratio",
      ],
      negative: 0.9,
      positive: 0.2,
      negativeLabel: "Higher leverage risk",
      positiveLabel: "Adequate coverage",
    },
    {
      title: "Market Data",
      subcategories: [
        "Volatility",
        "Beta",
        "Short interest",
        "Option skew",
      ],
      negative: 0.6,
      positive: 0.8,
      negativeLabel: "Elevated volatility",
      positiveLabel: "Supportive options skew",
    },
    {
      title: "Momentum Data",
      subcategories: [
        "RSI",
        "50/200-day MA crossovers",
        "Analyst rating momentum",
      ],
      negative: 0.2,
      positive: 1.6,
      negativeLabel: "Overbought RSI",
      positiveLabel: "Bullish MA crossover",
    },
    {
      title: "Sentiment/Alt Data",
      subcategories: [
        "Social media sentiment",
        "Insider trading",
        "ESG scores",
        "News flow",
      ],
      negative: 0.3,
      positive: 1.5,
      negativeLabel: "Mixed insider activity",
      positiveLabel: "Positive news flow",
    },
  ],
  priceMomentum: [
    {
      title: "Valuation Metrics",
      subcategories: ["P/E", "EV/EBITDA", "P/B", "PEG"],
      negative: 1.0,
      positive: 0.4,
      negativeLabel: "Rich multiples slowed momentum",
      positiveLabel: "Discount to peers helped",
    },
    {
      title: "Growth Metrics",
      subcategories: [
        "EPS growth YoY",
        "Revenue growth",
        "Free Cash Flow growth",
      ],
      negative: 0.5,
      positive: 1.9,
      negativeLabel: "Flat revenue trend",
      positiveLabel: "EPS cadence supported",
    },
    {
      title: "Profitability Ratios",
      subcategories: ["ROE", "ROA", "Operating margin", "Net margin"],
      negative: 0.2,
      positive: 1.1,
      negativeLabel: "Net margin dip",
      positiveLabel: "Operating leverage",
    },
    {
      title: "Leverage & Solvency",
      subcategories: [
        "Debt/Equity",
        "Interest coverage",
        "Cash ratio",
      ],
      negative: 0.7,
      positive: 0.3,
      negativeLabel: "Debt overhang",
      positiveLabel: "Cash buffer",
    },
    {
      title: "Market Data",
      subcategories: [
        "Volatility",
        "Beta",
        "Short interest",
        "Option skew",
      ],
      negative: 0.4,
      positive: 0.7,
      negativeLabel: "Rising short interest",
      positiveLabel: "Tightening skew",
    },
    {
      title: "Momentum Data",
      subcategories: [
        "RSI",
        "50/200-day MA crossovers",
        "Analyst rating momentum",
      ],
      negative: 0.1,
      positive: 1.8,
      negativeLabel: "Slightly overbought",
      positiveLabel: "Golden cross",
    },
    {
      title: "Sentiment/Alt Data",
      subcategories: [
        "Social media sentiment",
        "Insider trading",
        "ESG scores",
        "News flow",
      ],
      negative: 0.2,
      positive: 1.2,
      negativeLabel: "Muted social buzz",
      positiveLabel: "Analyst upgrades",
    },
  ],
  analystUpgrade: [
    {
      title: "Valuation Metrics",
      subcategories: ["P/E", "EV/EBITDA", "P/B", "PEG"],
      negative: 0.8,
      positive: 0.9,
      negativeLabel: "Premium valuation",
      positiveLabel: "Improving PEG",
    },
    {
      title: "Growth Metrics",
      subcategories: [
        "EPS growth YoY",
        "Revenue growth",
        "Free Cash Flow growth",
      ],
      negative: 0.3,
      positive: 2.0,
      negativeLabel: "Uneven FCF",
      positiveLabel: "Sustained EPS beats",
    },
    {
      title: "Profitability Ratios",
      subcategories: ["ROE", "ROA", "Operating margin", "Net margin"],
      negative: 0.2,
      positive: 1.3,
      negativeLabel: "ROA slip",
      positiveLabel: "Margin expansion",
    },
    {
      title: "Leverage & Solvency",
      subcategories: [
        "Debt/Equity",
        "Interest coverage",
        "Cash ratio",
      ],
      negative: 0.6,
      positive: 0.4,
      negativeLabel: "Debt to equity",
      positiveLabel: "Coverage stable",
    },
    {
      title: "Market Data",
      subcategories: [
        "Volatility",
        "Beta",
        "Short interest",
        "Option skew",
      ],
      negative: 0.5,
      positive: 0.6,
      negativeLabel: "Beta sensitivity",
      positiveLabel: "Skew supportive",
    },
    {
      title: "Momentum Data",
      subcategories: [
        "RSI",
        "50/200-day MA crossovers",
        "Analyst rating momentum",
      ],
      negative: 0.2,
      positive: 1.5,
      negativeLabel: "Overbought streak",
      positiveLabel: "Upgrade momentum",
    },
    {
      title: "Sentiment/Alt Data",
      subcategories: [
        "Social media sentiment",
        "Insider trading",
        "ESG scores",
        "News flow",
      ],
      negative: 0.2,
      positive: 1.4,
      negativeLabel: "Neutral social tone",
      positiveLabel: "Constructive news",
    },
  ],
  dividendCut: [
    {
      title: "Valuation Metrics",
      subcategories: ["P/E", "EV/EBITDA", "P/B", "PEG"],
      negative: 0.5,
      positive: 0.3,
      negativeLabel: "Rich dividend multiple",
      positiveLabel: "Yield support",
    },
    {
      title: "Growth Metrics",
      subcategories: [
        "EPS growth YoY",
        "Revenue growth",
        "Free Cash Flow growth",
      ],
      negative: 1.1,
      positive: 0.5,
      negativeLabel: "Weak FCF coverage",
      positiveLabel: "Revenue stabilization",
    },
    {
      title: "Profitability Ratios",
      subcategories: ["ROE", "ROA", "Operating margin", "Net margin"],
      negative: 0.9,
      positive: 0.4,
      negativeLabel: "Margin compression",
      positiveLabel: "ROE above peers",
    },
    {
      title: "Leverage & Solvency",
      subcategories: [
        "Debt/Equity",
        "Interest coverage",
        "Cash ratio",
      ],
      negative: 1.3,
      positive: 0.2,
      negativeLabel: "Debt service strain",
      positiveLabel: "Cash reserves",
    },
    {
      title: "Market Data",
      subcategories: [
        "Volatility",
        "Beta",
        "Short interest",
        "Option skew",
      ],
      negative: 0.4,
      positive: 0.4,
      negativeLabel: "High beta risk",
      positiveLabel: "Short interest easing",
    },
    {
      title: "Momentum Data",
      subcategories: [
        "RSI",
        "50/200-day MA crossovers",
        "Analyst rating momentum",
      ],
      negative: 0.3,
      positive: 0.6,
      negativeLabel: "Downtrend persists",
      positiveLabel: "Analyst stabilization",
    },
    {
      title: "Sentiment/Alt Data",
      subcategories: [
        "Social media sentiment",
        "Insider trading",
        "ESG scores",
        "News flow",
      ],
      negative: 0.6,
      positive: 0.7,
      negativeLabel: "Low sentiment",
      positiveLabel: "Improving ESG",
    },
  ],
  targetPrice: [
    {
      title: "Valuation Metrics",
      subcategories: ["P/E", "EV/EBITDA", "P/B", "PEG"],
      negative: 0.7,
      positive: 0.9,
      negativeLabel: "Premium to target",
      positiveLabel: "Re-rate potential",
    },
    {
      title: "Growth Metrics",
      subcategories: [
        "EPS growth YoY",
        "Revenue growth",
        "Free Cash Flow growth",
      ],
      negative: 0.4,
      positive: 1.7,
      negativeLabel: "Mixed EPS cadence",
      positiveLabel: "Revenue acceleration",
    },
    {
      title: "Profitability Ratios",
      subcategories: ["ROE", "ROA", "Operating margin", "Net margin"],
      negative: 0.3,
      positive: 1.2,
      negativeLabel: "Opex creep",
      positiveLabel: "Margin tailwinds",
    },
    {
      title: "Leverage & Solvency",
      subcategories: [
        "Debt/Equity",
        "Interest coverage",
        "Cash ratio",
      ],
      negative: 0.8,
      positive: 0.3,
      negativeLabel: "Higher leverage",
      positiveLabel: "Coverage intact",
    },
    {
      title: "Market Data",
      subcategories: [
        "Volatility",
        "Beta",
        "Short interest",
        "Option skew",
      ],
      negative: 0.5,
      positive: 0.6,
      negativeLabel: "Elevated vol",
      positiveLabel: "Skew constructive",
    },
    {
      title: "Momentum Data",
      subcategories: [
        "RSI",
        "50/200-day MA crossovers",
        "Analyst rating momentum",
      ],
      negative: 0.2,
      positive: 1.4,
      negativeLabel: "Overbought",
      positiveLabel: "Rating momentum",
    },
    {
      title: "Sentiment/Alt Data",
      subcategories: [
        "Social media sentiment",
        "Insider trading",
        "ESG scores",
        "News flow",
      ],
      negative: 0.2,
      positive: 1.1,
      negativeLabel: "Flat sentiment",
      positiveLabel: "Positive news",
    },
  ],
};

// Maps UI select to internal keys
const KPI_OPTIONS: Array<{ key: KpiKey; label: string }> = [
  { key: "earningsBeat", label: "Earnings Beat Probability" },
  { key: "priceMomentum", label: "Price Momentum (next 3 months)" },
  { key: "analystUpgrade", label: "Analyst Rating Upgrade Likelihood" },
  { key: "dividendCut", label: "Dividend Cut Probability" },
  { key: "targetPrice", label: "Target Price Revisions" },
];

// Dummy data for analysts insights and forecasts section
const ANALYST_CONSENSUS_DATA = [
  { name: "Buy", value: 60, color: "#10b981" }, // emerald-500
  { name: "Hold", value: 30, color: "#f59e0b" }, // amber-500
  { name: "Sell", value: 10, color: "#ef4444" }, // red-500
];

const ANALYST_COMMENTARY = [
  { 
    firm: "Morgan Stanley", 
    date: "Oct 10, 2025", 
    sentiment: "positive", 
    comment: "Earnings growth remains robust; expect upside in Q4." 
  },
  { 
    firm: "Goldman Sachs", 
    date: "Oct 9, 2025", 
    sentiment: "negative", 
    comment: "Valuation stretched; short-term correction likely." 
  },
  { 
    firm: "JP Morgan", 
    date: "Oct 8, 2025", 
    sentiment: "neutral", 
    comment: "Market volatility could cap near-term gains." 
  }
];

const FORECAST_DATA = [
  { month: "Jul", rating: 3.2 },
  { month: "Aug", rating: 3.4 },
  { month: "Sep", rating: 3.6 },
  { month: "Oct", rating: 3.8 }
];

export default function ImpactAnalysisPage() {
  // Read ticker/headline from URL params; fallback to dummy
  const params = useSearchParams();
  const ticker = params.get("ticker") || "NVDA";
  const headline = params.get("headline") || "Earnings preview: street eyes data center growth";

  // Selected KPI state
  const [selectedKpi, setSelectedKpi] = useState<KpiKey>("earningsBeat");
  // Expanded rows state keyed by title
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Active tab state: "impact" (default) or "recs" (Recommendations for Affected Clients)
  // In a future iteration, this could be synced to the URL (query/hash) for deep links
  const [activeTab, setActiveTab] = useState<"impact" | "recs">("impact");

  // Recommendations state - fetched from backend
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);

  const rows = useMemo(() => DUMMY_DATA[selectedKpi], [selectedKpi]);

  // Fetch recommendations from backend on mount
  useEffect(() => {
    async function loadRecommendations() {
      try {
        setIsLoadingRecommendations(true);
        const data = await fetchRecommendations();
        setRecommendations(data);
      } catch (error) {
        console.error("Failed to load recommendations:", error);
      } finally {
        setIsLoadingRecommendations(false);
      }
    }
    loadRecommendations();
  }, []);

  // Bar width scaling: simple linear mapping where max 2.5% => full width
  const maxPct = 2.5;
  const toWidth = (v: number) => `${Math.min(100, Math.round((v / maxPct) * 100))}%`;

  const kpiLabel = KPI_OPTIONS.find((k) => k.key === selectedKpi)?.label || "KPI";
  const selectedOption = KPI_OPTIONS.find((k) => k.key === selectedKpi)!;

  // ---------------------------------------------------------------------------
  // Filter recommendations using current context:
  // - If recommendation.news text includes the current headline (case-insensitive), include it
  // - Or if the news/recommendation mentions the current ticker (word boundary match), include it
  // This is a placeholder heuristic until backend filtering is available.
  // ---------------------------------------------------------------------------
  const filteredRecommendations = useMemo(() => {
    if (isLoadingRecommendations) return [];
    const lowerHeadline = (headline || "").toLowerCase();
    const tickerPattern = ticker ? new RegExp(`(\\b|\\W)${ticker}(\\b|\\W)`, "i") : null;
    return recommendations.filter((r) => {
      const newsMatch = r.news.toLowerCase().includes(lowerHeadline);
      const tickerInNews = tickerPattern ? tickerPattern.test(r.news) : false;
      const tickerInRec = tickerPattern ? tickerPattern.test(r.recommendation) : false;
      return newsMatch || tickerInNews || tickerInRec;
    });
  }, [headline, ticker, recommendations, isLoadingRecommendations]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 text-neutral-200">
      {/* Header Section */}
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-50">
          Impact of Features — {ticker}
        </h1>
        <p className="mt-1 text-sm text-neutral-400">As of Oct 1, 2025</p>

        {/* KPI Selector */}
        <div className="mt-4 flex items-center gap-3">
          <div className="text-sm text-neutral-300">Analyze:</div>
          <Listbox
            value={selectedOption}
            onChange={(opt) => setSelectedKpi(opt.key)}
          >
            <div className="relative">
              <Listbox.Button className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-neutral-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20">
                {selectedOption.label}
                <ChevronDown className="ml-1 h-4 w-4" />
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-20 mt-2 w-72 rounded-md border border-white/10 bg-neutral-900 p-1 shadow-xl focus:outline-none">
                  {KPI_OPTIONS.map((opt) => (
                    <Listbox.Option
                      key={opt.key}
                      value={opt}
                      className={({ active }) =>
                        `flex cursor-pointer items-center justify-between rounded px-2 py-1.5 text-sm ${active ? "bg-white/10" : ""}`
                      }
                    >
                      <span className="text-neutral-200">{opt.label}</span>
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>

        {/* Context headline (optional) */}
        <p className="mt-3 text-xs text-neutral-400">Headline: {headline}</p>

        {/* ------------------------------------------------------------------- */}
        {/* Tabs: Impact Analysis | Recommendations for Affected Clients         */}
        {/* Minimal visual style: bottom border with active underline highlight   */}
        {/* ------------------------------------------------------------------- */}
        <div className="mt-6 border-b border-white/10 flex items-center gap-6 text-sm">
          <button
            type="button"
            onClick={() => setActiveTab("impact")}
            className={`-mb-px pb-2 transition-colors ${
              activeTab === "impact"
                ? "text-neutral-50 border-b-2 border-emerald-400"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
            aria-current={activeTab === "impact" ? "page" : undefined}
          >
            Impact Analysis
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("recs")}
            className={`-mb-px pb-2 transition-colors ${
              activeTab === "recs"
                ? "text-neutral-50 border-b-2 border-emerald-400"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
            aria-current={activeTab === "recs" ? "page" : undefined}
          >
            Recommendations for Affected Clients
          </button>
        </div>
      </header>

      {/* Tab: Impact Analysis (default) */}
      {activeTab === "impact" && (
        <section className="rounded-xl border border-white/10 bg-neutral-900/70 p-4 sm:p-6 shadow-sm">
        {/* Table header */}
        <div className="grid grid-cols-3 items-center gap-4 border-b border-white/10 pb-3 text-xs uppercase tracking-wide text-neutral-400">
          <div className="text-left">Negative Impact on KPI</div>
          <div className="text-center">Feature</div>
          <div className="text-right">Positive Impact on KPI</div>
        </div>

        {/* Rows */}
        <div className="mt-3">
          {rows.map((row, idx) => {
            const isOpen = !!expanded[row.title];
            return (
              <div key={row.title} className={idx > 0 ? "border-t border-white/10" : ""}>
                <div className="grid grid-cols-3 items-center gap-4 py-3">
                  {/* Negative bar, aligned right, extends left */}
                  <div className="relative flex justify-end">
                    <div
                      className="relative h-6 min-w-[4rem] w-full max-w-[16rem]"
                      title={`${row.negativeLabel} — reduced ${kpiLabel} by ${row.negative.toFixed(1)}%`}
                    >
                      <div className="absolute inset-y-0 right-1/2 w-px bg-white/10" />
                      <div
                        className="absolute right-1/2 top-1/2 -translate-y-1/2 bg-rose-500/30 hover:bg-rose-500/40 transition-colors rounded"
                        style={{ width: toWidth(row.negative), height: "70%", transformOrigin: "right" }}
                      />
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 text-[11px] text-rose-300">
                        {row.negative.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Feature Category (center) */}
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded((prev) => ({ ...prev, [row.title]: !prev[row.title] }))
                    }
                    className="group inline-flex items-center justify-center gap-2 text-center text-sm text-neutral-200 hover:text-neutral-50"
                    aria-expanded={isOpen}
                    aria-controls={`feature-${idx}`}
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                    <span className="underline-offset-4 group-hover:underline">
                      {row.title}
                    </span>
                  </button>

                  {/* Positive bar, aligned left, extends right */}
                  <div className="relative flex justify-start">
                    <div
                      className="relative h-6 min-w-[4rem] w-full max-w-[16rem]"
                      title={`${row.positiveLabel} — improved ${kpiLabel} by ${row.positive.toFixed(1)}%`}
                    >
                      <div className="absolute inset-y-0 left-1/2 w-px bg-white/10" />
                      <div
                        className="absolute left-1/2 top-1/2 -translate-y-1/2 bg-emerald-500/30 hover:bg-emerald-500/40 transition-colors rounded"
                        style={{ width: toWidth(row.positive), height: "70%", transformOrigin: "left" }}
                      />
                      <div className="absolute -right-2 top-1/2 -translate-y-1/2 text-[11px] text-emerald-300">
                        {row.positive.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expandable subcategory content */}
                {isOpen && (
                  <div id={`feature-${idx}`} className="pb-3">
                    <div className="mx-auto grid grid-cols-3 items-start gap-4">
                      <div />
                      <div className="rounded-md border border-white/10 bg-white/5 p-3 text-xs text-neutral-200">
                        <div className="mb-2 text-[11px] uppercase tracking-wide text-neutral-400">
                          Sub-categories
                        </div>
                        <ul className="list-disc pl-5 space-y-1">
                          {row.subcategories.map((s) => (
                            <li key={s} className="marker:text-neutral-400">
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        </section>
      )}

      {/* Tab: Recommendations for Affected Clients */}
      {activeTab === "recs" && (
        <section className="rounded-xl border border-white/10 bg-neutral-900/70 p-4 sm:p-6 shadow-sm">
          {/* Header for recommendations feed */}
          <h2 className="text-lg sm:text-xl font-semibold text-neutral-50 mb-4">
            Recommendations for Affected Clients
          </h2>
          {/* Note: In production, this list will be server-fetched using ticker/headline */}
          <div className="space-y-6">
            {filteredRecommendations.length === 0 && (
              <div className="text-sm text-neutral-400">
                No recommendations match the current context.
              </div>
            )}
            {filteredRecommendations.map((rec, idx) => (
              <article key={idx} className="bg-gradient-to-b from-gray-900 to-gray-950 shadow-md p-6 rounded-2xl border border-white/10">
                {/* Card header: Client + News */}
                <div className="mb-2">
                  <div className="text-white font-semibold text-lg">{rec.client_name}</div>
                  <div className="text-gray-400 italic text-sm mb-2">{rec.news}</div>
                </div>
                {/* Main recommendation paragraph */}
                <p className="text-sm text-neutral-200 leading-relaxed mb-4">
                  {rec.recommendation}
                </p>
                {/* Details grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl p-4 text-gray-200 border-l-4 border-green-400 bg-green-950/30">
                    <div className="font-semibold text-sm mb-1 tracking-wide text-green-400">
                      <TrendingUp className="w-4 h-4 inline mr-1 align-text-bottom" />
                      Rate of Return
                    </div>
                    <div className="text-sm text-neutral-200">{rec.rate_of_return}</div>
                  </div>
                  <div className="rounded-xl p-4 text-gray-200 border-l-4 border-yellow-400 bg-yellow-950/30">
                    <div className="font-semibold text-sm mb-1 tracking-wide text-yellow-400">
                      <Shield className="w-4 h-4 inline mr-1 align-text-bottom" />
                      Portfolio Risk
                    </div>
                    <div className="text-sm text-neutral-200">{rec.portfolio_risk}</div>
                  </div>
                  <div className="rounded-xl p-4 text-gray-200 border-l-4 border-blue-400 bg-blue-950/30">
                    <div className="font-semibold text-sm mb-1 tracking-wide text-blue-400">
                      <Coins className="w-4 h-4 inline mr-1 align-text-bottom" />
                      Earnings
                    </div>
                    <div className="text-sm text-neutral-200">{rec.bank_commissions}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {/* Dummy CTA button for future report generation */}
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-white/10 bg-white/10 px-4 py-2 text-sm text-neutral-100 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              Generate Full Report
            </button>
          </div>
        </section>
      )}

      {/* Analysts' Insights & Forecasts Section (kept visible under Impact tab) */}
      {activeTab === "impact" && (
        <section className="mt-6">
          <h2 className="text-xl font-semibold text-neutral-50 mb-4">Analysts' Insights & Forecasts</h2>
        
        {/* Three-column responsive grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* LEFT COLUMN - Analyst Consensus Snapshot (visual) */}
          <div className="rounded-xl border border-white/10 bg-neutral-900/70 p-4 shadow-sm">
            <h3 className="text-sm font-medium text-neutral-200 mb-3">Analyst Consensus</h3>
            
            {/* Donut chart showing analyst consensus */}
            <div className="h-32 w-full mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ANALYST_CONSENSUS_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    dataKey="value"
                  >
                    {ANALYST_CONSENSUS_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Chart caption */}
            <p className="text-xs text-neutral-400 text-center">
              Based on 28 analyst ratings (past 30 days)
            </p>
            
            {/* Legend */}
            <div className="mt-3 space-y-1">
              {ANALYST_CONSENSUS_DATA.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-neutral-300">{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* MIDDLE COLUMN - Analyst Commentary Highlights (text) */}
          <div className="rounded-xl border border-white/10 bg-neutral-900/70 p-4 shadow-sm">
            <h3 className="text-sm font-medium text-neutral-200 mb-3">Recent Commentary</h3>
            
            <div className="space-y-3">
              {ANALYST_COMMENTARY.map((comment, index) => (
                <div key={index} className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-neutral-300">{comment.firm}</span>
                    <span className="text-xs text-neutral-400">{comment.date}</span>
                    <span className="text-xs">
                      {comment.sentiment === "positive" && "🟢"}
                      {comment.sentiment === "neutral" && "🟡"}
                      {comment.sentiment === "negative" && "🔴"}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-200 leading-relaxed">
                    "{comment.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN - Forecast Metrics (visual + numeric) */}
          <div className="rounded-xl border border-white/10 bg-neutral-900/70 p-4 shadow-sm">
            <h3 className="text-sm font-medium text-neutral-200 mb-3">Forecast Metrics</h3>
            
            <div className="space-y-3">
              {/* Target Price Range mini-card */}
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="text-xs text-neutral-400 mb-1">Target Price Range</div>
                <div className="text-sm font-medium text-neutral-100">
                  $120 – $145
                  <span className="text-xs text-neutral-400 ml-2">(Current: $125)</span>
                </div>
              </div>

              {/* Expected EPS Growth mini-card */}
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="text-xs text-neutral-400 mb-1">Expected EPS Growth</div>
                <div className="text-sm font-medium text-emerald-400">
                  +7.2% <span className="text-xs text-neutral-400">(next quarter)</span>
                </div>
              </div>

              {/* Consensus Rating Change mini-card */}
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="text-xs text-neutral-400 mb-2">Consensus Rating Trend</div>
                <div className="h-8 w-full mb-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={FORECAST_DATA}>
                      <Line 
                        type="monotone" 
                        dataKey="rating" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={{ fill: "#10b981", strokeWidth: 2, r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <ArrowUp className="h-3 w-3" />
                  <span>Upward trend (3.2 → 3.8)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </section>
      )}
    </div>
  );
}

