'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AuthButton } from './auth-button';
import { signupSchema, type SignupInput } from '@/lib/auth/schemas';

type TattooistSignupInput = SignupInput & { bio?: string };

export function TattooistRegistrationForm() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [step, setStep] = useState(1);
	const [isMobile, setIsMobile] = useState(false);
	const router = useRouter();

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 1024);
		};
		handleResize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const { register, handleSubmit, formState: { errors, isValid }, watch, trigger } = useForm<TattooistSignupInput>({
		resolver: zodResolver(signupSchema as any),
		mode: 'onChange' as const,
		defaultValues: {
			email: '',
			password: '',
			role: 'tattooist' as const,
			bio: '',
		},
	});

	const watched = watch();
	const isStep1Valid = !!watched.email && !!watched.password && !errors.email && !errors.password;

	const handleNext = async () => {
		const ok = await trigger(['email', 'password']);
		if (ok) setStep(step + 1);
	};

	const handleBack = () => setStep(step - 1);

	const onSubmit = async (data: TattooistSignupInput) => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await fetch('/api/auth/signup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: data.email,
					password: data.password,
					role: 'tattooist',
				}),
			});
			const result = await response.json();
			if (!response.ok) {
				setError(result.error || 'Registration failed');
				return;
			}
			router.push('/onboarding/tattooist');
		} catch (e) {
			setError('An unexpected error occurred');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			{error && (
				<div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
					{error}
				</div>
			)}

			{isMobile && (
				<div>
					<div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
						<span>Step {step} of 2</span>
						<span>{Math.round((step / 2) * 100)}% complete</span>
					</div>
					<div className="w-full bg-muted rounded-full h-2">
						<div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${(step / 2) * 100}%` }} />
					</div>
				</div>
			)}

			{(step === 1 || !isMobile) && (
				<div className={`space-y-4 ${step !== 1 && isMobile ? 'hidden' : ''}`}>
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input id="email" type="email" placeholder="Enter your email" className="h-12 text-base lg:h-9 lg:text-sm" aria-invalid={errors.email ? 'true' : 'false'} {...register('email')} />
						{errors.email && <p className="text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>}
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input id="password" type="password" placeholder="Create a password" className="h-12 text-base lg:h-9 lg:text-sm" aria-invalid={errors.password ? 'true' : 'false'} {...register('password')} />
						{errors.password && <p className="text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>}
					</div>
				</div>
			)}

			{(step === 2 || !isMobile) && (
				<div className={`space-y-2 ${step !== 2 && isMobile ? 'hidden' : ''}`}>
					<Label htmlFor="bio">Short Bio</Label>
					<Textarea id="bio" placeholder="Tell clients about your style and experience" className="min-h-[120px]" {...register('bio')} />
					<p className="text-xs text-muted-foreground">You can edit this later during onboarding.</p>
				</div>
			)}

			{isMobile ? (
				<div className="space-y-2">
					{step < 2 && (
						<AuthButton type="button" onClick={handleNext} disabled={!isStep1Valid}>
							Next
						</AuthButton>
					)}
					{step === 2 && (
						<AuthButton type="submit" isLoading={isLoading} disabled={!isValid}>
							Create Account
						</AuthButton>
					)}
					{step > 1 && (
						<AuthButton type="button" variant="outline" onClick={handleBack} disabled={isLoading}>
							Back
						</AuthButton>
					)}
				</div>
			) : (
				<div>
					<AuthButton type="submit" isLoading={isLoading} disabled={!isValid}>
						Create Account
					</AuthButton>
				</div>
			)}
		</form>
	);
}
