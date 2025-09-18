export function ApprovalWaitingScreen() {
	return (
		<div className="max-w-md mx-auto p-4 space-y-6 text-center">
			<div className="flex items-center justify-center">
				<div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
					<span className="text-sm text-muted-foreground">Pending</span>
				</div>
			</div>
			<h1 className="text-2xl font-semibold">Awaiting Admin Approval</h1>
			<p className="text-muted-foreground">
				Thanks for completing onboarding. Our team will review your profile shortly. You'll receive an email when you're approved.
			</p>
			<div className="text-sm text-muted-foreground">
				Need help? Contact support at <a className="underline" href="mailto:support@claudeink.com">support@claudeink.com</a>
			</div>
		</div>
	);
}
