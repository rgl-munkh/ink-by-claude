"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export function QuickActions() {
	const [open, setOpen] = useState(false);
	return (
		<div className="fixed bottom-20 right-4 z-30 lg:bottom-6">
			<div className={`mb-2 grid gap-2 transition-all ${open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
				<Button className="justify-start" variant="secondary" size="sm">Add Portfolio</Button>
				<Button className="justify-start" variant="secondary" size="sm">Set Availability</Button>
				<Button className="justify-start" variant="secondary" size="sm">Quick Settings</Button>
			</div>
			<Button size="lg" className="rounded-full h-14 w-14 shadow-lg" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Quick actions">
				<span className={`i-lucide-plus ${open ? 'rotate-45' : ''} transition-transform`} />
			</Button>
		</div>
	);
}
