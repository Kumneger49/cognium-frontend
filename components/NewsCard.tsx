"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import clsx from "clsx";
import ClientModal, { type ClientItem } from "./ClientModal";
import { fetchClientsForTicker } from "../lib/api";

export type NewsCardProps = {
	news: {
		ticker: string;
		tag: string;
		title: string;
		summary: string;
		link: string;
		sentiment_score: number;
		relevance_score?: number;
		reason?: string;
	};
};

/**
 * NewsCard renders a single news subcard. It supports two expandable sections:
 * - Summary
 * - Affected Clients (with modal per client)
 */
export default function NewsCard({ news }: NewsCardProps) {
	const [showSummary, setShowSummary] = useState(false);
	const [showClients, setShowClients] = useState(false);
	const [clients, setClients] = useState<ClientItem[] | null>(null);
	const [activeClient, setActiveClient] = useState<ClientItem | null>(null);

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

	async function handleShowClients() {
		setShowClients((v) => !v);
		if (!clients) {
			const data = await fetchClientsForTicker(news.ticker);
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
					<div className="mt-3 flex items-center gap-2">
						<span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-neutral-300">
							{news.tag}
						</span>
						<span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-neutral-300">
							{news.ticker}
						</span>
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
							<a
								href={news.link}
								target="_blank"
								rel="noreferrer"
								className="mt-3 inline-flex items-center gap-1 text-emerald-300 hover:underline"
								aria-label="Read original article in new tab"
							>
								<BadgeCheck className="h-4 w-4" /> Read Original
							</a>
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
									<button
										key={c.name}
										onClick={() => setActiveClient(c)}
									className="rounded-md border border-white/10 bg-gradient-to-br from-sky-500/10 to-emerald-500/10 px-3 py-2 text-left text-sm text-neutral-100 hover:from-sky-500/20 hover:to-emerald-500/20"
									>
										<div className="font-medium">{c.name}</div>
										<div className="text-neutral-300 text-xs">{c.impact}</div>
									</button>
								))}
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			<ClientModal
				isOpen={!!activeClient}
				onClose={() => setActiveClient(null)}
				client={activeClient}
			/>
		</motion.div>
	);
}


