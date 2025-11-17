import { type NewsItem, type NewsSource } from "../data/mockNews";
export type { NewsItem, NewsSource } from "../data/mockNews";

// API utilities used by the UI. These are purposely simple and fully typed.

/**
 * Recommendation type from backend
 */
export type Recommendation = {
	ticker: string;
	news: string;
	sources?: Array<{
		name: string;
		title: string;
		link: string;
		relevance_score?: number;
		sentiment_score?: number;
	}>;
	client_name: string;
	recommendation: string;
	rate_of_return: string;
	portfolio_risk: string;
	bank_commissions: string;
	tag?: string;
};

/**
 * fetchNews
 * Returns a list of news items extracted from recommendations data.
 * Uses the recommendations endpoint and converts recommendations to news items.
 */
export async function fetchNews(): Promise<NewsItem[]> {
	// Simulate latency for UX testing
	await new Promise((r) => setTimeout(r, 200));
	
	// Fetch recommendations and extract news items from them
	const res = await fetch(`https://api.cognium.xyz/api/recommendations`);
	const json = await res.json();
	const recommendations = (json?.data ?? []) as Recommendation[];
	
	// Convert recommendations to news items
	// Each recommendation contains news information that can be displayed
	const newsItems: NewsItem[] = recommendations.map((rec) => {
		// Extract title from news field (first line is usually the topic)
		const newsLines = rec.news.split('\n');
		const topicLine = newsLines.find(line => line.startsWith('Topic:'));
		const summaryLine = newsLines.find(line => line.startsWith('Summary:'));
		
		const title = topicLine ? topicLine.replace('Topic:', '').trim() : rec.news.substring(0, 100);
		const summary = summaryLine ? summaryLine.replace('Summary:', '').trim() : rec.news;
		
		// Use first source for link and metadata, or create a default
		const firstSource = rec.sources && rec.sources.length > 0 ? rec.sources[0] : null;
		const sentimentScore = firstSource?.sentiment_score ?? 0;
		const relevanceScore = firstSource?.relevance_score;
		
		return {
			ticker: rec.ticker,
			tag: rec.tag || '',
			title: firstSource?.title || title,
			summary: summary,
			news: rec.news,
			sources: rec.sources || [],
			sentiment_score: sentimentScore,
			relevance_score: relevanceScore,
			link: firstSource?.link || '',
			source: firstSource?.name || '',
			reason: rec.recommendation,
		};
	});
	
	console.log("fetchNews: received", recommendations.length, "recommendations; converted to", newsItems.length, "news items");
	return newsItems;
}

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
	const res = await fetch(`https://api.cognium.xyz/api/recommendations`)
	const json = await res.json()
	const allRecommendations = (json?.data ?? []) as Recommendation[]

	if (allRecommendations.length === 0) {
		return [];
	}

	// Filter recommendations that mention the ticker or headline
	const tickerPattern = ticker ? new RegExp(`(\\b|\\W)${ticker}(\\b|\\W)`, "i") : null;
	const lowerHeadline = (headline || "").toLowerCase();

	const relevantRecommendations = allRecommendations.filter((rec) => {
		// Check if ticker matches
		if (rec.ticker && rec.ticker.toLowerCase() === ticker.toLowerCase()) {
			return true;
		}
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
 * Fetches from the /api/recommendations endpoint.
 */
export async function fetchRecommendations(): Promise<Recommendation[]> {
	// Simulate latency for UX testing
	await new Promise((r) => setTimeout(r, 200));
	const res = await fetch(`https://api.cognium.xyz/api/recommendations`)
	const json = await res.json()
	
	// Handle the response structure: { status: "success", data: [...], count: number }
	if (json.status === "success" && Array.isArray(json.data)) {
		const rawItems = json.data as Recommendation[]
		console.log("fetchRecommendations: received", rawItems.length, "items")
		return rawItems;
	}
	
	// Fallback for backward compatibility
	const rawItems = (json?.data ?? []) as Recommendation[]
	console.log("fetchRecommendations: received", Array.isArray(rawItems) ? rawItems.length : 0, "items")
	return rawItems;
}

/**
 * regenerateRecommendations
 * Triggers regeneration of recommendations on the backend.
 * This endpoint regenerates the news/recommendations data.
 * Returns a success status when regeneration is complete.
 */
export async function regenerateRecommendations(): Promise<{ success: boolean; message?: string }> {
	try {
		const res = await fetch(`https://api.cognium.xyz/api/regenerate-recommendations`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		
		if (!res.ok) {
			throw new Error(`HTTP error! status: ${res.status}`);
		}
		
		const json = await res.json();
		
		// Handle different response formats
		if (json.status === "success" || res.ok) {
			console.log("regenerateRecommendations: success");
			return { success: true, message: json.message || "Recommendations regenerated successfully" };
		}
		
		return { success: false, message: json.message || "Unknown error occurred" };
	} catch (error) {
		console.error("regenerateRecommendations: error", error);
		return { 
			success: false, 
			message: error instanceof Error ? error.message : "Failed to regenerate recommendations" 
		};
	}
}

/**
 * Map backend news item to frontend NewsItem format.
 * Handles new format with multiple sources and tags.
 */
export function mapBackendToNewsItem(input: Record<string, unknown>): NewsItem {
	const sources = Array.isArray(input.sources) 
		? (input.sources as Array<Record<string, unknown>>).map(s => ({
			name: String(s.name || ''),
			title: String(s.title || ''),
			link: String(s.link || ''),
			relevance_score: s.relevance_score ? Number(s.relevance_score) : undefined,
			sentiment_score: s.sentiment_score ? Number(s.sentiment_score) : undefined,
		}))
		: [];

	// For backward compatibility, use first source for legacy fields
	const firstSource = sources[0];
	
	return {
		ticker: String(input.ticker || ''),
		tag: String(input.tag || ''),
		title: String(input.title ?? input.headline ?? ''),
		summary: String(input.summary || ''),
		news: input.news ? String(input.news) : undefined,
		sources: sources,
		sentiment_score: Number(input.sentiment_score ?? input.sentiment ?? 0),
		relevance_score: input.relevance_score ? Number(input.relevance_score) : firstSource?.relevance_score,
		reason: input.reason ? String(input.reason) : undefined,
		source: firstSource?.name || String(input.source || ''),
		link: firstSource?.link || String(input.link || ''),
	};
}
