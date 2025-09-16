'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AuthButton } from './auth-button';
import { signupSchema, type SignupInput } from '@/lib/auth/schemas';

export function RegisterForm() {
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

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    trigger,
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: 'onChange' as const,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'customer' as const,
    },
  });

  const watchedFields = watch();
  const isStep1Valid = watchedFields.firstName && watchedFields.lastName && !errors.firstName && !errors.lastName;
  const isStep2Valid = watchedFields.email && watchedFields.password && !errors.email && !errors.password;

  const handleNext = async () => {
    const fieldsToValidate = step === 1 ? ['firstName', 'lastName'] as const : ['email', 'password'] as const;
    const isStepValid = await trigger(fieldsToValidate);

    if (isStepValid) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Registration failed');
        return;
      }

      // Role-based redirect
      const { user } = result;
      switch (user.role) {
        case 'admin':
          router.push('/admin');
          break;
        case 'tattooist':
          router.push('/tattooist');
          break;
        default:
          router.push('/dashboard');
          break;
      }
    } catch (error) {
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

      {/* Progress indicator for mobile */}
      {isMobile && (
        <div>
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <span>Step {step} of 3</span>
            <span>{Math.round((step / 3) * 100)}% complete</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Step 1: Personal Information */}
      {(step === 1 || !isMobile) && (
        <div className={`space-y-4 ${step !== 1 && isMobile ? 'hidden' : ''}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="Enter your first name"
                className="h-12 text-base lg:h-9 lg:text-sm"
                aria-invalid={errors.firstName ? 'true' : 'false'}
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Enter your last name"
                className="h-12 text-base lg:h-9 lg:text-sm"
                aria-invalid={errors.lastName ? 'true' : 'false'}
                {...register('lastName')}
              />
              {errors.lastName && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.lastName.message}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Account Information */}
      {(step === 2 || !isMobile) && (
        <div className={`space-y-4 ${step !== 2 && isMobile ? 'hidden' : ''}`}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="h-12 text-base lg:h-9 lg:text-sm"
              aria-invalid={errors.email ? 'true' : 'false'}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              className="h-12 text-base lg:h-9 lg:text-sm"
              aria-invalid={errors.password ? 'true' : 'false'}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Role Selection */}
      {(step === 3 || !isMobile) && (
        <div className={`space-y-4 ${step !== 3 && isMobile ? 'hidden' : ''}`}>
          <div className="space-y-2">
            <Label htmlFor="role">Account Type</Label>
            <Select
              onValueChange={(value) => setValue('role', value as 'customer' | 'tattooist' | 'admin')}
              defaultValue="customer"
            >
              <SelectTrigger className="h-12 text-base lg:h-9 lg:text-sm">
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="tattooist">Tattoo Artist</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.role.message}</p>
            )}
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Customer:</strong> Browse artists, book appointments</p>
            <p><strong>Tattoo Artist:</strong> Create portfolio, manage bookings</p>
          </div>
        </div>
      )}

      {/* Mobile Navigation Buttons */}
      {isMobile && (
        <div className="space-y-2">
          {step < 3 && (
            <AuthButton
              type="button"
              onClick={handleNext}
              disabled={
                (step === 1 && !isStep1Valid) ||
                (step === 2 && !isStep2Valid)
              }
            >
              Next
            </AuthButton>
          )}

          {step === 3 && (
            <AuthButton type="submit" isLoading={isLoading} disabled={!isValid}>
              Create Account
            </AuthButton>
          )}

          {step > 1 && (
            <AuthButton
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isLoading}
            >
              Back
            </AuthButton>
          )}
        </div>
      )}

      {/* Desktop Submit Button */}
      {!isMobile && (
        <div>
          <AuthButton type="submit" isLoading={isLoading} disabled={!isValid}>
            Create Account
          </AuthButton>
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </form>
  );
}