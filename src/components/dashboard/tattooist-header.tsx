"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function TattooistHeader() {
	return (
		<header className="sticky top-0 z-20 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
			<div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
				<Link href="/dashboard" className="font-semibold">Tattooist</Link>
				<div className="flex items-center gap-2">
					<Button variant="ghost" size="icon" aria-label="Notifications">
						<span className="i-lucide-bell" />
					</Button>
					<Link href="/profile">
						<Button variant="outline" className="h-9">Profile</Button>
					</Link>
				</div>
			</div>
		</header>
	);
}
