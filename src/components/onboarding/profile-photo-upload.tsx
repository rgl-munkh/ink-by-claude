"use client";

import React from 'react';

interface ProfilePhotoUploadProps {
	value?: string;
	onChange: (file: File | null, previewUrl?: string) => void;
}

export function ProfilePhotoUpload({ value, onChange }: ProfilePhotoUploadProps) {
	return (
		<div className="space-y-3">
			<div className="flex items-center gap-4">
				<div className="w-30 h-30 rounded-full overflow-hidden bg-muted flex items-center justify-center" style={{ width: 120, height: 120 }}>
					{value ? (
						<img src={value} alt="Profile" className="w-full h-full object-cover" />
					) : (
						<span className="text-sm text-muted-foreground">120×120</span>
					)}
				</div>
				<input
					type="file"
					accept="image/*"
					onChange={(e) => {
						const file = e.target.files?.[0] ?? null;
						const preview = file ? URL.createObjectURL(file) : undefined;
						onChange(file, preview);
					}}
				/>
			</div>
			<p className="text-xs text-muted-foreground">We will upload this securely after you complete onboarding.</p>
		</div>
	);
}
