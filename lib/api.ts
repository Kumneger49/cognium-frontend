import { mockNews, type NewsItem } from "../data/mockNews";

// API utilities used by the UI. These are purposely simple and fully typed.
// TODO: BACKEND — Replace the mock implementations below with real fetch calls.

// Get the backend API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
	const res = await fetch(`${API_URL}/`)
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
 * Recommendation type from backend
 */
export type Recommendation = {
	news: string;
	client_name: string;
	recommendation: string;
	rate_of_return: string;
	portfolio_risk: string;
	bank_commissions: string;
};

/**
 * fetchClientsForTicker
 * Given a ticker and optionally a headline, returns a list of clients
 * likely affected by the story based on recommendations data.
 * 
 * Filters recommendations by:
 * - If the news text includes the ticker (word boundary match)
 * - If the recommendation mentions the ticker
 */
export async function fetchClientsForTicker(
	ticker: string,
	headline?: string
): Promise<Array<{ name: string; impact: string }>> {
	// Fetch all recommendations from backend
	const res = await fetch(`${API_URL}/recommendations`)
	const json = await res.json()
	const allRecommendations = (json?.message?.data ?? json?.data ?? json ?? []) as Recommendation[]

	if (allRecommendations.length === 0) {
		return [];
	}

	// Filter recommendations that mention the ticker or headline
	const tickerPattern = ticker ? new RegExp(`(\\b|\\W)${ticker}(\\b|\\W)`, "i") : null;
	const lowerHeadline = (headline || "").toLowerCase();

	const relevantRecommendations = allRecommendations.filter((rec) => {
		const newsMatch = headline ? rec.news.toLowerCase().includes(lowerHeadline) : false;
		const tickerInNews = tickerPattern ? tickerPattern.test(rec.news) : false;
		const tickerInRec = tickerPattern ? tickerPattern.test(rec.recommendation) : false;
		return newsMatch || tickerInNews || tickerInRec;
	});

	// Create a map to get unique clients with their recommendations
	const clientMap = new Map<string, Recommendation[]>();
	for (const rec of relevantRecommendations) {
		if (!clientMap.has(rec.client_name)) {
			clientMap.set(rec.client_name, []);
		}
		clientMap.get(rec.client_name)!.push(rec);
	}

	// Convert to array of ClientItem objects
	const clients: Array<{ name: string; impact: string }> = [];
	for (const [clientName, recs] of clientMap) {
		// Use the first recommendation as the impact description
		const firstRec = recs[0];
		const impact = `${firstRec.news.substring(0, 80)}...`;
		clients.push({
			name: clientName,
			impact
		});
	}

	return clients;
}

/**
 * fetchRecommendations
 * Returns a list of all recommendations from the backend.
 * Fetches from the /recommendations endpoint.
 */
export async function fetchRecommendations(): Promise<Recommendation[]> {
	// Simulate latency for UX testing
	await new Promise((r) => setTimeout(r, 200));
	const res = await fetch(`${API_URL}/recommendations`)
	const json = await res.json()
	const rawItems = (json?.message?.data ?? json?.data ?? json ?? []) as Recommendation[]
	console.log("fetchRecommendations: received", Array.isArray(rawItems) ? rawItems.length : 0, "items")
	return rawItems;
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


