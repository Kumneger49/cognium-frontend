"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import Filters, { type FiltersState } from "../components/Filters";
import NewsCard from "../components/NewsCard";
import { fetchNews, regenerateRecommendations, type NewsItem } from "../lib/api";

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filters, setFilters] = useState<FiltersState>({ positive: false, negative: false, tag: "All" });
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);

  const loadNews = async () => {
    try {
      const newsData = await fetchNews();
      setNews(newsData);
    } catch (error) {
      console.error("Failed to load news:", error);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setRegenerateError(null);
    
    try {
      const result = await regenerateRecommendations();
      
      if (result.success) {
        // Wait a moment for backend to process, then refresh news
        await new Promise(resolve => setTimeout(resolve, 1000));
        await loadNews();
      } else {
        setRegenerateError(result.message || "Failed to regenerate recommendations");
      }
    } catch (error) {
      console.error("Regenerate error:", error);
      setRegenerateError(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsRegenerating(false);
    }
  };

  // Extract unique tags from comma-separated tag strings
  const tags = useMemo(() => {
    const tagSet = new Set<string>();
    news.forEach((n) => {
      const tagList = n.tag.split(',').map(t => t.trim()).filter(t => t.length > 0);
      tagList.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [news]);

  const filtered = useMemo(() => {
    return news.filter((n) => {
      const score = Number(n.sentiment_score ?? 0);
      // Toggle logic: if both toggles are off or both on → allow all. Otherwise filter by sign.
      const wantsPositive = filters.positive && !filters.negative ? true : filters.positive && filters.negative ? undefined : filters.positive ? true : undefined;
      const wantsNegative = filters.negative && !filters.positive ? true : filters.positive && filters.negative ? undefined : filters.negative ? true : undefined;
      if (wantsPositive === true && score < 0) return false;
      if (wantsNegative === true && score >= 0) return false;
      // Check if any of the news item's tags match the selected filter
      if (filters.tag !== "All") {
        const newsTags = n.tag.split(',').map(t => t.trim());
        if (!newsTags.includes(filters.tag)) return false;
      }
      return true;
    });
  }, [news, filters]);

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-neutral-100 relative">
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

      {/* Regenerate News Button - Bottom Left */}
      <div className="fixed bottom-6 left-6 z-10">
        <button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm
            transition-all duration-200 shadow-lg
            ${isRegenerating
              ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-emerald-500/50'
            }
          `}
          title={isRegenerating ? "Regenerating news..." : "Regenerate news from backend"}
        >
          <RefreshCw 
            className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} 
          />
          <span>{isRegenerating ? 'Regenerating...' : 'Regenerate News'}</span>
        </button>
        
        {regenerateError && (
          <div className="mt-2 px-3 py-2 bg-red-900/80 border border-red-700 rounded-lg text-red-200 text-xs max-w-xs">
            {regenerateError}
          </div>
        )}
      </div>
    </div>
  );
}
