"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import clsx from "clsx";
import { fetchClientsForTicker } from "../lib/api";

import { type NewsItem } from "../lib/api";

type ClientItem = { name: string; impact: string };

export type NewsCardProps = {
	news: NewsItem;
};

/**
 * NewsCard renders a single news subcard. It supports expandable sections:
 * - Summary
 * - Affected Clients
 * - Sources (when multiple sources are available)
 */
export default function NewsCard({ news }: NewsCardProps) {
	const [showSummary, setShowSummary] = useState(false);
	const [showClients, setShowClients] = useState(false);
	const [showSources, setShowSources] = useState(false);
	const [clients, setClients] = useState<ClientItem[] | null>(null);

	const isPositive = news.sentiment_score >= 0;
	const pillClass = useMemo(
		() =>
			clsx(
				"ml-auto inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
				isPositive
					? "border-emerald-500/50 text-emerald-300"
					: "border-rose-500/50 text-rose-300"
			),
		[isPositive]
	);

	// Parse comma-separated tags
	const tags = useMemo(() => {
		return news.tag.split(',').map(t => t.trim()).filter(t => t.length > 0);
	}, [news.tag]);

	// Get sources, with fallback to legacy source/link
	const sources = useMemo(() => {
		if (news.sources && news.sources.length > 0) {
			return news.sources;
		}
		// Fallback to legacy format
		if (news.source && news.link) {
			return [{
				name: news.source,
				title: news.title,
				link: news.link,
			}];
		}
		return [];
	}, [news.sources, news.source, news.link, news.title]);

	async function handleShowClients() {
		setShowClients((v) => !v);
		if (!clients) {
			const data = await fetchClientsForTicker(news.ticker, news.title);
			setClients(data);
		}
	}

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: 10 }}
			className="rounded-2xl border border-white/10 bg-neutral-900/80 p-4 shadow-sm backdrop-blur-sm"
		>
			<div className="flex items-start gap-3">
				<div className="flex-1">
					<h3 className="text-sm sm:text-base font-medium text-neutral-100">
						{news.title}
					</h3>
					<div className="mt-3 flex flex-wrap items-center gap-2">
						{tags.map((tag, idx) => (
							<span key={idx} className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-neutral-300">
								{tag}
							</span>
						))}
						<span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-neutral-300">
							{news.ticker}
						</span>
						{sources.length > 0 && (
							<>
								{sources.length === 1 ? (
									<a
										href={sources[0].link}
										target="_blank"
										rel="noreferrer"
										className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-neutral-300 hover:bg-white/10 cursor-pointer"
										aria-label={`Read article from ${sources[0].name}`}
									>
										{sources[0].name}
									</a>
								) : (
									<button
										onClick={() => setShowSources((v) => !v)}
										className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-neutral-300 hover:bg-white/10 cursor-pointer"
										aria-label="Toggle sources"
									>
										Sources ({sources.length})
									</button>
								)}
							</>
						)}
					</div>
				</div>
				<span className={pillClass} aria-label="Sentiment">
					{isPositive ? "Positive" : "Negative"}
				</span>
			</div>

			<div className="mt-4 flex flex-wrap gap-3">
				<button
					onClick={() => setShowSummary((v) => !v)}
					className="rounded-md border border-white/10 px-4 py-2 text-sm text-neutral-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
				>
					View Summary
				</button>
				<button
					onClick={handleShowClients}
					className="rounded-md border border-white/10 px-4 py-2 text-sm text-neutral-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
				>
					View Affected Clients
				</button>
				<button
					onClick={() => {
						const params = new URLSearchParams({
							ticker: news.ticker,
							headline: news.title,
						});
						window.open(`/impact-analysis?${params.toString()}`, "_blank", "noopener,noreferrer");
					}}
					className="rounded-md border border-white/10 px-4 py-2 text-sm text-neutral-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
					aria-label="Open Impact Analysis in new tab"
				>
					Show Impact
				</button>
			</div>

			<AnimatePresence initial={false}>
				{showSummary && (
					<motion.div
						key="summary"
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ type: "tween", duration: 0.25 }}
						className="mt-4 overflow-hidden rounded-md border border-white/10 bg-white/5"
					>
						<div className="border-b border-white/10" />
						<div className="p-4 text-sm text-neutral-200">
							<p>{news.summary}</p>
							{news.reason && (
								<p className="mt-2 text-neutral-300">
									Reason: <span className="text-neutral-100">{news.reason}</span>
								</p>
							)}
							{sources.length > 0 && (
								<div className="mt-3 space-y-2">
									{sources.map((source, idx) => (
										<a
											key={idx}
											href={source.link}
											target="_blank"
											rel="noreferrer"
											className="block inline-flex items-center gap-1 text-emerald-300 hover:underline"
											aria-label={`Read original article from ${source.name} in new tab`}
										>
											<BadgeCheck className="h-4 w-4" /> {source.title || source.name}
										</a>
									))}
								</div>
							)}
						</div>
					</motion.div>
				)}

				{showClients && (
					<motion.div
						key="clients"
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ type: "tween", duration: 0.25 }}
						className="mt-4 overflow-hidden rounded-md border border-white/10 bg-white/5"
					>
						<div className="border-b border-white/10" />
						<div className="p-4">
						<div className="grid gap-2 sm:grid-cols-2">
								{(clients ?? []).map((c) => (
									<div
										key={c.name}
										className="rounded-md border border-white/10 bg-gradient-to-br from-sky-500/10 to-emerald-500/10 px-3 py-2 text-left text-sm text-neutral-100"
									>
										<div className="font-medium">{c.name}</div>
										<div className="text-neutral-300 text-xs">{c.impact}</div>
									</div>
								))}
							</div>
						</div>
					</motion.div>
				)}

				{showSources && sources.length > 0 && (
					<motion.div
						key="sources"
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ type: "tween", duration: 0.25 }}
						className="mt-4 overflow-hidden rounded-md border border-white/10 bg-white/5"
					>
						<div className="border-b border-white/10" />
						<div className="p-4 space-y-2">
							{sources.map((source, idx) => (
								<div key={idx} className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 p-3">
									<div className="flex-1">
										<div className="text-sm font-medium text-neutral-100">{source.title || source.name}</div>
										<div className="text-xs text-neutral-400 mt-1">{source.name}</div>
									</div>
									<a
										href={source.link}
										target="_blank"
										rel="noreferrer"
										className="ml-3 inline-flex items-center gap-1 text-emerald-300 hover:underline text-sm"
										aria-label={`Read article from ${source.name}`}
									>
										<BadgeCheck className="h-4 w-4" /> Read
									</a>
								</div>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}


