"use client";

import React from 'react';

interface SpecialtyTagsSelectionProps {
	options: string[];
	value: string[];
	onToggle: (tag: string) => void;
}

export function SpecialtyTagsSelection({ options, value, onToggle }: SpecialtyTagsSelectionProps) {
	return (
		<div className="flex gap-2 overflow-x-auto py-1">
			{options.map((tag) => {
				const selected = value.includes(tag);
				return (
					<button
						key={tag}
						type="button"
						className={`px-3 py-1 rounded-full border whitespace-nowrap ${selected ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground'}`}
						onClick={() => onToggle(tag)}
					>
						{tag}
					</button>
				);
			})}
		</div>
	);
}
