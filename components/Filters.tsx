"use client";

import React from "react";
import { Switch, Listbox, Transition } from "@headlessui/react";
import { ChevronDown, Check } from "lucide-react";
import { Fragment } from "react";

export type FiltersState = {
	positive: boolean;
	negative: boolean;
	tag: string | "All";
};

type Props = {
	availableTags: string[];
	value: FiltersState;
	onChange: (next: FiltersState) => void;
};

/**
 * Filters component
 * Renders Positive/Negative toggles and a Tags dropdown for filtering.
 * Uses Headless UI primitives for accessibility.
 */
export default function Filters({ availableTags, value, onChange }: Props) {
	const set = (partial: Partial<FiltersState>) => onChange({ ...value, ...partial });

	return (
		<div className="flex flex-wrap items-center gap-3">
			<div className="text-sm text-neutral-300 mr-2">Filter by</div>

			<Toggle
				label="Positive"
				checked={value.positive}
				onChange={(v) => set({ positive: v })}
				color="green"
			/>
			<Toggle
				label="Negative"
				checked={value.negative}
				onChange={(v) => set({ negative: v })}
				color="red"
			/>

			<TagDropdown
				options={["All", ...availableTags]}
				value={value.tag}
				onChange={(t) => set({ tag: t })}
			/>
		</div>
	);
}

function Toggle({ label, checked, onChange, color }: { label: string; checked: boolean; onChange: (v: boolean) => void; color: "green" | "red" }) {
	return (
		<label className="inline-flex select-none items-center gap-2">
			<span className="text-sm text-neutral-200">{label}</span>
			<Switch
				checked={checked}
				onChange={onChange}
				className={
					`relative inline-flex h-6 w-10 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 ` +
					(checked ? (color === "green" ? "bg-emerald-500/70" : "bg-rose-500/70") : "bg-white/10")
				}
				aria-label={label}
			>
				<span className="sr-only">{label}</span>
				<span
					className={
						`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ` +
						(checked ? "translate-x-5" : "translate-x-1")
					}
				/>
			</Switch>
		</label>
	);
}

function TagDropdown({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
	return (
		<Listbox value={value} onChange={onChange}>
			<div className="relative">
				<Listbox.Button className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-neutral-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20">
					{value || "All"}
					<ChevronDown className="ml-1 h-4 w-4" />
				</Listbox.Button>
				<Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
					<Listbox.Options className="absolute z-20 mt-2 w-44 rounded-md border border-white/10 bg-neutral-900 p-1 shadow-xl focus:outline-none">
						{options.map((opt) => (
							<Listbox.Option
								key={opt}
								value={opt}
								className={({ active }) =>
									`flex cursor-pointer items-center justify-between rounded px-2 py-1.5 text-sm ${active ? "bg-white/10" : ""}`
								}
							>
                                {({ selected }) => (
                                    <>
                                        <span className="text-neutral-200">{opt}</span>
                                        {selected ? <Check className="h-4 w-4 text-emerald-400" /> : <span className="w-4" />}
                                    </>
                                )}
							</Listbox.Option>
						))}
					</Listbox.Options>
				</Transition>
			</div>
		</Listbox>
	);
}


