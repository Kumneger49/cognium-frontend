// Type definitions and mock data for news items.
// Note: The actual data fetching is handled in lib/api.ts which uses the main backend API.
// This file is kept for type definitions and optional mock data for testing.

export type NewsSource = {
	name: string;
	title: string;
	link: string;
	relevance_score?: number;
	sentiment_score?: number;
};

export type NewsItem = {
	// Stock ticker or instrument code (e.g., "AAPL", "TSLA")
	ticker: string;
	// High level category for filtering (e.g., "Tech", "Bonds") - can be comma-separated
	tag: string;
	// Main title (Topic from news field)
	title: string;
	// Brief summary text displayed when expanding the card (Summary from news field)
	summary: string;
	// Full news string (Topic + Summary)
	news?: string;
	// Array of news sources
	sources: NewsSource[];
	// Numeric sentiment score; negative values imply negative news
	sentiment_score: number;
	// Legacy: optional relevance score (0..1) - now in sources
	relevance_score?: number;
	// Legacy: short reason string
	reason?: string;
	// Legacy: single source - kept for backward compatibility, use sources[0] if available
	source?: string;
	// Legacy: single link - kept for backward compatibility, use sources[0].link if available
	link?: string;
};

// Mock data array (kept for reference/testing purposes)
// Note: The actual fetchNews function is now in lib/api.ts and uses the main backend API
export const mockNews: NewsItem[] = [
	{
		ticker: "NVDA",
		tag: "Tech",
		title:
			"Nvidia: Firm shares big AI dreams with OpenAI, announce a strategic partnership",
		summary:
			"Nvidia and OpenAI extend their collaboration to accelerate AI infrastructure and developer tooling, signaling growing enterprise adoption.",
		sources: [{
			name: "techcrunch.com",
			title: "Nvidia: Firm shares big AI dreams with OpenAI, announce a strategic partnership",
			link: "https://example.com/nvda-openai",
			relevance_score: 0.9,
			sentiment_score: 0.72,
		}],
		sentiment_score: 0.72,
		relevance_score: 0.9,
		reason: "Partnership expands AI capacity and demand visibility.",
		source: "techcrunch.com",
		link: "https://example.com/nvda-openai",
	},
	{
		ticker: "FED",
		tag: "Bonds",
		title: "Federal Reserve hints at tapering asset purchases",
		summary:
			"Minutes suggest the FOMC may begin to reduce balance sheet expansion sooner than expected, nudging yields higher.",
		sources: [{
			name: "wsj.com",
			title: "Federal Reserve hints at tapering asset purchases",
			link: "https://example.com/fed-taper",
			relevance_score: 0.8,
			sentiment_score: -0.41,
		}],
		sentiment_score: -0.41,
		relevance_score: 0.8,
		reason: "Tapering typically pressures bond prices and affects duration risk.",
		source: "wsj.com",
		link: "https://example.com/fed-taper",
	},
	{
		ticker: "AAPL",
		tag: "Tech",
		title: "Apple announces new product focused on spatial computing",
		summary:
			"Apple unveils a developer preview of its spatial computing SDK, opening opportunities across gaming and productivity.",
		sources: [{
			name: "techcrunch.com",
			title: "Apple announces new product focused on spatial computing",
			link: "https://example.com/aapl-spatial",
			relevance_score: 0.7,
			sentiment_score: 0.35,
		}],
		sentiment_score: 0.35,
		relevance_score: 0.7,
		reason: "Developer interest and ecosystem growth potential.",
		source: "techcrunch.com",
		link: "https://example.com/aapl-spatial",
	},
	{
		ticker: "XOM",
		tag: "Energy",
		title: "Crude prices slide on inventory surprise, energy names pull back",
		summary:
			"Unexpected build in crude inventories puts pressure on integrated oil names amid global demand uncertainty.",
		sources: [{
			name: "wsj.com",
			title: "Crude prices slide on inventory surprise, energy names pull back",
			link: "https://example.com/crude-inventory",
			relevance_score: 0.6,
			sentiment_score: -0.3,
		}],
		sentiment_score: -0.3,
		relevance_score: 0.6,
		reason: "Inventory build weighs on margins and short-term outlook.",
		source: "wsj.com",
		link: "https://example.com/crude-inventory",
	},
];


