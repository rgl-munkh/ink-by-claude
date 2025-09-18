"use client";

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type DashboardMetrics = {
	pendingRequests: number;
	todaysAppointments: number;
	weeklyEarnings: number;
	portfolioViews: number;
};

type Booking = {
	id: string;
	customerId: string;
	tattooistId: string;
	slot: string;
	status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
};

function isSameDay(a: Date, b: Date): boolean {
	return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function DashboardOverview() {
	const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
	const [pending, setPending] = useState<Booking[]>([]);
	const [today, setToday] = useState<Booking[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	async function fetchData() {
		try {
			setError(null);
			const [pendingRes, confirmedRes] = await Promise.all([
				fetch('/api/bookings?status=pending'),
				fetch('/api/bookings?status=confirmed'),
			]);
			if (!pendingRes.ok || !confirmedRes.ok) throw new Error('Failed to fetch data');
			const pendingJson: { bookings: Booking[] } = await pendingRes.json();
			const confirmedJson: { bookings: Booking[] } = await confirmedRes.json();

			const pendingList = pendingJson.bookings ?? [];
			const confirmedList = confirmedJson.bookings ?? [];
			const now = new Date();
			const todays = confirmedList.filter((b) => isSameDay(new Date(b.slot), now));

			setPending(pendingList);
			setToday(todays);

			const derived: DashboardMetrics = {
				pendingRequests: pendingList.length,
				todaysAppointments: todays.length,
				weeklyEarnings: 0,
				portfolioViews: 0,
			};
			setMetrics(derived);
		} catch {
			setError('Unable to load dashboard');
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		fetchData();
		const id = setInterval(fetchData, 15000);
		return () => clearInterval(id);
	}, []);

	if (loading) {
		return <div className="text-sm text-muted-foreground">Loading dashboard...</div>;
	}
	if (error) {
		return <div className="text-sm text-red-600">{error}</div>;
	}
	if (!metrics) return null;

	return (
		<div className="space-y-4 pb-20">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
				<Card className="p-4">
					<div className="text-sm text-muted-foreground">Pending requests</div>
					<div className="text-2xl font-semibold">{metrics.pendingRequests}</div>
				</Card>
				<Card className="p-4">
					<div className="text-sm text-muted-foreground">Today&apos;s appointments</div>
					<div className="text-2xl font-semibold">{metrics.todaysAppointments}</div>
				</Card>
				<Card className="p-4">
					<div className="text-sm text-muted-foreground">This week&apos;s earnings</div>
					<div className="text-2xl font-semibold">${metrics.weeklyEarnings}</div>
				</Card>
				<Card className="p-4 md:col-span-2 lg:col-auto">
					<div className="text-sm text-muted-foreground">Portfolio views</div>
					<div className="text-2xl font-semibold">{metrics.portfolioViews}</div>
				</Card>
			</div>

			<div className="space-y-2">
				<h2 className="font-medium">Pending booking requests</h2>
				<div className="space-y-2">
					{pending.length === 0 && (
						<div className="text-sm text-muted-foreground">No pending requests</div>
					)}
					{pending.map((b) => (
						<Card key={b.id} className="p-3 flex items-center justify-between">
							<div className="text-sm">Request #{b.id.slice(0, 6)} • {new Date(b.slot).toLocaleString()}</div>
							<div className="flex gap-2">
								<Button size="sm" variant="outline">View</Button>
								<Button size="sm">Approve</Button>
							</div>
						</Card>
					))}
				</div>
			</div>

			<div className="space-y-2">
				<h2 className="font-medium">Today&apos;s appointments</h2>
				<div className="space-y-2">
					{today.length === 0 && (
						<div className="text-sm text-muted-foreground">No appointments today</div>
					)}
					{today.map((a) => (
						<Card key={a.id} className="p-3">
							<div className="text-sm">#{a.id.slice(0, 6)} at {new Date(a.slot).toLocaleTimeString()}</div>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}
