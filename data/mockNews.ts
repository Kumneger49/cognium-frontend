// Dummy news dataset used by the UI for development.
// TODO: BACKEND — Replace this with your real backend data flow.

export type NewsItem = {
	// Stock ticker or instrument code (e.g., "AAPL", "TSLA")
	ticker: string;
	// High level category for filtering (e.g., "Tech", "Bonds")
	tag: string;
	// Main title (backend changed from "headline" → "title")
	title: string;
	// Brief summary text displayed when expanding the card
	summary: string;
	// Link to the full article
	link: string;
	// Numeric sentiment score; negative values imply negative news
	sentiment_score: number;
	// New: optional relevance score (0..1)
	relevance_score?: number;
	// New: short reason string
	reason?: string;
	// News source (e.g., "techcrunch.com", "bbc.com")
	source: string;
};

export async function fetchNews(): Promise<NewsItem[]> {
	// Simulate latency for UX testing
	await new Promise((r) => setTimeout(r, 200));
	const data = await fetch('http://127.0.0.1:8000/')
	const posts = await data.json()
	console.log(posts)
	return posts;
}

export const mockNews: NewsItem[] = [
	{
		ticker: "NVDA",
		tag: "Tech",
		title:
			"Nvidia: Firm shares big AI dreams with OpenAI, announce a strategic partnership",
		summary:
			"Nvidia and OpenAI extend their collaboration to accelerate AI infrastructure and developer tooling, signaling growing enterprise adoption.",
		link: "https://example.com/nvda-openai",
		sentiment_score: 0.72,
		relevance_score: 0.9,
		reason: "Partnership expands AI capacity and demand visibility.",
		source: "techcrunch.com",
	},
	{
		ticker: "FED",
		tag: "Bonds",
		title: "Federal Reserve hints at tapering asset purchases",
		summary:
			"Minutes suggest the FOMC may begin to reduce balance sheet expansion sooner than expected, nudging yields higher.",
		link: "https://example.com/fed-taper",
		sentiment_score: -0.41,
		relevance_score: 0.8,
		reason: "Tapering typically pressures bond prices and affects duration risk.",
		source: "wsj.com",
	},
	{
		ticker: "AAPL",
		tag: "Tech",
		title: "Apple announces new product focused on spatial computing",
		summary:
			"Apple unveils a developer preview of its spatial computing SDK, opening opportunities across gaming and productivity.",
		link: "https://example.com/aapl-spatial",
		sentiment_score: 0.35,
		relevance_score: 0.7,
		reason: "Developer interest and ecosystem growth potential.",
		source: "techcrunch.com",
	},
	{
		ticker: "XOM",
		tag: "Energy",
		title: "Crude prices slide on inventory surprise, energy names pull back",
		summary:
			"Unexpected build in crude inventories puts pressure on integrated oil names amid global demand uncertainty.",
		link: "https://example.com/crude-inventory",
		sentiment_score: -0.3,
		relevance_score: 0.6,
		reason: "Inventory build weighs on margins and short-term outlook.",
		source: "wsj.com",
	},
];


