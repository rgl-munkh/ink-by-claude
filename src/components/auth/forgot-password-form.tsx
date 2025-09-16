'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthButton } from './auth-button';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').max(255, 'Email must be less than 255 characters'),
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange' as const,
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call for forgot password
      // In a real implementation, this would send a reset email
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSubmitted(true);
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-full w-16 h-16 bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold">Check your email</h3>
        <p className="text-muted-foreground">
          We&apos;ve sent password reset instructions to your email address.
          Please check your inbox and follow the link to reset your password.
        </p>
        <div className="pt-4">
          <Link
            href="/auth/login"
            className="text-primary hover:underline text-sm"
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email address"
          className="h-12 text-base lg:h-9 lg:text-sm"
          aria-invalid={errors.email ? 'true' : 'false'}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        We&apos;ll send you an email with instructions to reset your password.
      </div>

      <AuthButton type="submit" isLoading={isLoading} disabled={!isValid}>
        Send Reset Instructions
      </AuthButton>

      <div className="text-center text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link href="/auth/login" className="text-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    </form>
  );
}