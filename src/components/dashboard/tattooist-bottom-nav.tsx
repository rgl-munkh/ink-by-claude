"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
	{ href: '/dashboard', label: 'Dashboard', icon: 'i-lucide-layout-dashboard' },
	{ href: '/portfolio', label: 'Portfolio', icon: 'i-lucide-images' },
	{ href: '/calendar', label: 'Calendar', icon: 'i-lucide-calendar' },
	{ href: '/bookings', label: 'Bookings', icon: 'i-lucide-calendar-check' },
];

export function TattooistBottomNav() {
	const pathname = usePathname();
	return (
		<nav className="fixed bottom-0 inset-x-0 z-20 border-t bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
			<div className="grid grid-cols-4 max-w-5xl mx-auto">
				{TABS.map((tab) => {
					const active = pathname === tab.href;
					return (
						<Link key={tab.href} href={tab.href} className={`flex flex-col items-center justify-center py-2 text-xs ${active ? 'text-primary' : 'text-muted-foreground'}`}>
							<span className={tab.icon} />
							<span>{tab.label}</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
