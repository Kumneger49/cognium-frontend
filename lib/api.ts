import { mockNews, type NewsItem } from "../data/mockNews";

// API utilities used by the UI. These are purposely simple and fully typed.
// TODO: BACKEND — Replace the mock implementations below with real fetch calls.

/**
 * fetchNews
 * Returns a list of news items. Currently returns mock data.
 *
 * TODO: BACKEND — Replace implementation with your endpoint, e.g.:
 *   return fetch('/api/news')
 *     .then((res) => res.json())
 *     .then((data: Array<YourBackendNewsShape>) => data.map(mapBackendToNewsItem));
 *
 * Expected backend JSON item shape example:
 * [
 *   {
 *     "ticker": "AAPL",
 *     "tag": "Tech",
 *     "title": "Apple announces new product",
 *     "summary": "Short summary text...",
 *     "link": "https://example.com/article",
 *     "sentiment_score": 0.42, // negative if < 0
 *     "relevance_score": 0.8,
 *     "reason": "Short explanation"
 *   }
 * ]
 */
export async function fetchNews(): Promise<NewsItem[]> {
	// Simulate latency for UX testing
	await new Promise((r) => setTimeout(r, 200));
	const res = await fetch('http://127.0.0.1:8000/')
	const json = await res.json()
	const rawItems = (json?.message?.data ?? json?.data ?? json ?? []) as any[]
	const mapped = rawItems.map(mapBackendToNewsItem)
	console.log("fetchNews: received", Array.isArray(rawItems) ? rawItems.length : 0, "items; mapped", mapped.length)
	return mapped;
}

// export async function fetchNews(): Promise<NewsItem[]> {
// 	const res = await fetch("https://your-backend-domain.com/api/news");
// 	const data = await res.json();
// 	return data.map(mapBackendToNewsItem);
//   }
  

/**
 * fetchClientsForTicker
 * Given a ticker (or any key your backend uses), returns a list of clients
 * likely affected by the story. I return mock data for demo purposes.
 *
 * TODO: BACKEND — Swap with a real call, for example:
 *   return fetch(`/api/clients?ticker=${ticker}`)
 *     .then((res) => res.json());
 *
 * Expected JSON example:
 *   [ { "name": "Acme Capital", "impact": "High exposure via NVDA overweight." }, ... ]
 */
export async function fetchClientsForTicker(
	ticker: string
): Promise<Array<{ name: string; impact: string }>> {
	await new Promise((r) => setTimeout(r, 150));
	const generic = [
		{ name: "Joseph Wright", impact: "Show Impact for details." },
		{ name: "Whitney Hicks", impact: "Show Impact for details." },
		{ name: "Riverstone Advisors", impact: "Show Impact for details." },
	];
	return generic;
}

/**
 * Example mapping util if backend field names differ.
 * Adjust and use inside fetchNews() when integrating.
 */
export function mapBackendToNewsItem(input: any): NewsItem {
	return {
		ticker: input.ticker,
		tag: input.tag,
		title: input.title ?? input.headline,
		summary: input.summary,
		link: input.link,
		sentiment_score: Number(input.sentiment_score ?? input.sentiment ?? 0),
		relevance_score: input.relevance_score,
		reason: input.reason,
	};
}


