"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AuthButton } from '@/components/auth/auth-button';
import { useRouter } from 'next/navigation';
import { ProfilePhotoUpload } from '@/components/onboarding/profile-photo-upload';
import { SpecialtyTagsSelection } from '@/components/onboarding/specialty-tags-selection';

export type OnboardingData = {
	firstName: string;
	lastName: string;
	bio: string;
	specialties: string[];
	experienceYears?: number;
	profilePhotoUrl?: string;
	portfolioItems?: { url: string; caption?: string }[];
};

const SPECIALTY_OPTIONS = [
	"Traditional",
	"Neo-traditional",
	"Blackwork",
	"Realism",
	"Watercolor",
	"Japanese",
	"Minimalist",
	"Geometric",
];

export function OnboardingWizard() {
	const router = useRouter();
	const [step, setStep] = useState(1);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<OnboardingData>({
		firstName: '',
		lastName: '',
		bio: '',
		specialties: [],
		experienceYears: undefined,
		profilePhotoUrl: undefined,
		portfolioItems: [],
	});

	const updateField = (field: keyof OnboardingData, value: any) => {
		setData((prev) => ({ ...prev, [field]: value }));
	};

	const toggleSpecialty = (tag: string) => {
		setData((prev) => ({
			...prev,
			specialties: prev.specialties.includes(tag)
				? prev.specialties.filter((t) => t !== tag)
				: [...prev.specialties, tag],
		}));
	};

	const handleNext = async () => setStep((s) => Math.min(5, s + 1));
	const handleBack = () => setStep((s) => Math.max(1, s - 1));

	const handleComplete = async () => {
		setIsLoading(true);
		setError(null);
		try {
			// TODO: Persist onboarding data via API endpoints
			router.push('/onboarding/approval');
		} catch (e) {
			setError('Failed to complete onboarding');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-4">
			<div>
				<div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
					<span>Step {step} of 5</span>
					<span>{Math.round((step / 5) * 100)}% complete</span>
				</div>
				<div className="w-full bg-muted rounded-full h-2">
					<div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${(step / 5) * 100}%` }} />
				</div>
			</div>

			{error && (
				<div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
					{error}
				</div>
			)}

			{step === 1 && (
				<div className="space-y-4">
					<div className="grid grid-cols-1 gap-4">
						<div className="space-y-2">
							<Label htmlFor="firstName">First Name</Label>
							<Input id="firstName" value={data.firstName} onChange={(e) => updateField('firstName', e.target.value)} className="h-12 text-base" />
						</div>
						<div className="space-y-2">
							<Label htmlFor="lastName">Last Name</Label>
							<Input id="lastName" value={data.lastName} onChange={(e) => updateField('lastName', e.target.value)} className="h-12 text-base" />
						</div>
					</div>
				</div>
			)}

			{step === 2 && (
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="bio">Bio</Label>
						<Textarea id="bio" className="min-h-[120px]" value={data.bio} onChange={(e) => updateField('bio', e.target.value)} placeholder="Describe your style and experience" />
					</div>
					<div className="space-y-2">
						<Label>Specialties</Label>
						<SpecialtyTagsSelection options={SPECIALTY_OPTIONS} value={data.specialties} onToggle={toggleSpecialty} />
						<div className="space-y-2">
							<Label htmlFor="experience">Years of Experience</Label>
							<Input id="experience" type="number" min={0} value={data.experienceYears ?? ''} onChange={(e) => updateField('experienceYears', Number(e.target.value))} className="h-12 text-base" />
						</div>
					</div>
				</div>
			)}

			{step === 3 && (
				<div className="space-y-4">
					<Label>Profile Photo</Label>
					<ProfilePhotoUpload value={data.profilePhotoUrl} onChange={(_file, preview) => updateField('profilePhotoUrl', preview)} />
				</div>
			)}

			{step === 4 && (
				<div className="space-y-4">
					<Label>Initial Portfolio (optional)</Label>
					<p className="text-sm text-muted-foreground">You can skip this for now and add items later.</p>
					<input type="file" multiple accept="image/*" onChange={(e) => {
						const files = Array.from(e.target.files ?? []);
						const urls = files.map((f) => ({ url: URL.createObjectURL(f as File) }));
						updateField('portfolioItems', urls);
					}} />
					{data.portfolioItems && data.portfolioItems.length > 0 && (
						<div className="grid grid-cols-3 gap-2">
							{data.portfolioItems.map((item, idx) => (
								<img key={idx} src={item.url} alt={`Portfolio ${idx + 1}`} className="w-full h-24 object-cover rounded" />
							))}
						</div>
					)}
				</div>
			)}

			{step === 5 && (
				<div className="space-y-4">
					<p className="text-sm text-muted-foreground">Review your details and complete onboarding to proceed to approval.</p>
					<div className="text-sm">
						<p><strong>Name:</strong> {data.firstName} {data.lastName}</p>
						<p><strong>Specialties:</strong> {data.specialties.join(', ') || 'None selected'}</p>
					</div>
				</div>
			)}

			<div className="space-y-2">
				{step < 5 ? (
					<AuthButton type="button" onClick={handleNext}>Next</AuthButton>
				) : (
					<AuthButton type="button" onClick={handleComplete} isLoading={isLoading}>Complete Onboarding</AuthButton>
				)}
				{step > 1 && (
					<AuthButton type="button" variant="outline" onClick={handleBack} disabled={isLoading}>Back</AuthButton>
				)}
			</div>
		</div>
	);
}