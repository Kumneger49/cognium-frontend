"use client";

/**
 * README (quick start for developers)
 * 1. npx create-next-app@latest news-dashboard --use-npm --typescript
 * 2. cd news-dashboard
 * 3. npm install tailwindcss postcss autoprefixer @headlessui/react framer-motion lucide-react clsx react-modal
 *    npx tailwindcss init -p
 * 4. npm run dev → open http://localhost:3000
 *
 * Backend integration:
 * - Update `lib/api.ts#fetchNews` to call your endpoint and map fields.
 * - Expected JSON example:
 *   [
 *     {
 *       "ticker": "AAPL",
 *       "tag": "Tech",
 *       "title": "Apple announces new product",
 *       "summary": "Short summary text...",
 *       "link": "https://example.com/article",
 *       "sentiment_score": 0.4,
 *       "relevance_score": 0.8,
 *       "reason": "Short rationale"
 *     }
 *   ]
 */

import { useEffect, useMemo, useState } from "react";
import Filters, { type FiltersState } from "../components/Filters";
import NewsCard from "../components/NewsCard";
import { fetchNews, type NewsItem } from "../lib/api";

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filters, setFilters] = useState<FiltersState>({ positive: false, negative: false, tag: "All" });

  useEffect(() => {
    fetchNews().then(setNews);
  }, []);

  const tags = useMemo(() => Array.from(new Set(news.map((n) => n.tag))), [news]);

  const filtered = useMemo(() => {
    return news.filter((n) => {
      const score = Number(n.sentiment_score ?? 0);
      // Toggle logic: if both toggles are off or both on → allow all. Otherwise filter by sign.
      const wantsPositive = filters.positive && !filters.negative ? true : filters.positive && filters.negative ? undefined : filters.positive ? true : undefined;
      const wantsNegative = filters.negative && !filters.positive ? true : filters.positive && filters.negative ? undefined : filters.negative ? true : undefined;
      if (wantsPositive === true && score < 0) return false;
      if (wantsNegative === true && score >= 0) return false;
      if (filters.tag !== "All" && n.tag !== filters.tag) return false;
      return true;
    });
  }, [news, filters]);

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-neutral-100">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6">News Dashboard</h1>

        <div className="rounded-[28px] border border-white/10 bg-neutral-900/70 p-5 shadow-xl ring-1 ring-emerald-500/10">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-lg font-semibold text-emerald-300">All News</div>
            <Filters availableTags={tags} value={filters} onChange={setFilters} />
          </div>

          <div className="space-y-5">
            {filtered.map((item, idx) => (
              <NewsCard key={(item.title ?? idx) + idx} news={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
