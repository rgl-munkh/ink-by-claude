'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Clock, User } from 'lucide-react';
import BookingCalendar from '@/components/booking-calendar';
import Link from 'next/link';

interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  availabilityBlockId: string;
  note?: string;
}

interface Artist {
  id: string;
  name: string;
  hourlyRate: number;
  location: string;
}

export default function DirectBookPage() {
  const params = useParams();
  const router = useRouter();
  const artistId = params.id as string;

  const [artist, setArtist] = useState<Artist | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    tattooDescription: '',
    estimatedHours: '2',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const fetchArtistData = useCallback(async () => {
    try {
      // Mock data - replace with actual API call
      const mockArtist: Artist = {
        id: artistId,
        name: 'Alex Rivera',
        hourlyRate: 150,
        location: 'Downtown Studio, NYC',
      };
      setArtist(mockArtist);
    } catch (error) {
      console.error('Error fetching artist data:', error);
    }
  }, [artistId]);

  useEffect(() => {
    fetchArtistData();
  }, [fetchArtistData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const calculateTotal = () => {
    if (!artist || !formData.estimatedHours) return { total: 0, deposit: 0 };
    const hours = parseFloat(formData.estimatedHours);
    const total = hours * artist.hourlyRate;
    const deposit = total * 0.25; // 25% deposit
    return { total, deposit };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSlot) {
      alert('Please select a time slot');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const idempotencyKey = `direct-book-${artistId}-${Date.now()}-${Math.random().toString(36)}`;

      const response = await fetch(`/api/artist/${artistId}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotStartTime: selectedSlot.startTime.toISOString(),
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          customerEmail: formData.customerEmail || undefined,
          tattooDescription: formData.tattooDescription,
          estimatedHours: parseFloat(formData.estimatedHours),
          idempotencyKey,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create booking');
      }

      const data = await response.json();
      setSubmitStatus('success');

      // Redirect to booking confirmation
      setTimeout(() => {
        router.push(`/booking/${data.booking.id}/confirm`);
      }, 2000);
    } catch (error) {
      console.error('Error creating booking:', error);
      setSubmitStatus('error');
      alert(error instanceof Error ? error.message : 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!artist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const { total, deposit } = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/artist/${artistId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Portfolio
              </Button>
            </Link>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Book Directly with {artist.name}</h1>
            <p className="text-gray-600 mt-1">Select your preferred time and provide details for your tattoo session.</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {submitStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800">🎉 Booking created successfully! Redirecting to confirmation...</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar */}
          <div>
            <BookingCalendar
              artistId={artistId}
              onSlotSelect={handleSlotSelect}
              selectedSlot={selectedSlot}
            />
          </div>

          {/* Booking Form */}
          <div className="space-y-6">
            {/* Selected Slot Summary */}
            {selectedSlot && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Selected Appointment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="font-medium">{formatDate(selectedSlot.startTime)}</div>
                    <div className="text-gray-600">
                      {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedSlot.duration} minutes • {artist.location}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Booking Details Form */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
                <CardDescription>Tell us about yourself and your tattoo idea</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="customerName">Full Name *</Label>
                        <Input
                          id="customerName"
                          name="customerName"
                          value={formData.customerName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="customerPhone">Phone Number *</Label>
                        <Input
                          id="customerPhone"
                          name="customerPhone"
                          type="tel"
                          value={formData.customerPhone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="customerEmail">Email (optional)</Label>
                      <Input
                        id="customerEmail"
                        name="customerEmail"
                        type="email"
                        value={formData.customerEmail}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Tattoo Details */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Tattoo Details</h3>
                    <div>
                      <Label htmlFor="tattooDescription">Description *</Label>
                      <Textarea
                        id="tattooDescription"
                        name="tattooDescription"
                        placeholder="Describe your tattoo idea, style preferences, size, placement, etc."
                        value={formData.tattooDescription}
                        onChange={handleInputChange}
                        required
                        className="min-h-[100px]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="estimatedHours">Estimated Duration (hours) *</Label>
                      <Input
                        id="estimatedHours"
                        name="estimatedHours"
                        type="number"
                        min="0.5"
                        max="12"
                        step="0.5"
                        value={formData.estimatedHours}
                        onChange={handleInputChange}
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        How long do you think this tattoo will take? This helps with pricing estimates.
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Pricing Summary */}
                  <div className="space-y-3">
                    <h3 className="font-medium">Pricing Estimate</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span>Hourly Rate:</span>
                        <span>${artist.hourlyRate}/hour</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated Hours:</span>
                        <span>{formData.estimatedHours || '0'}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Total Estimate:</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-green-700">
                        <span>Deposit Required (25%):</span>
                        <span>${deposit.toFixed(2)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      Final pricing will be confirmed during your appointment. You&apos;ll have 15 minutes to complete payment after booking.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !selectedSlot}
                    className="w-full"
                    size="lg"
                  >
                    {isSubmitting ? 'Creating Booking...' : `Book Appointment (${deposit > 0 ? `$${deposit.toFixed(2)} deposit` : 'Free'})`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}