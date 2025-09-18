'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UploadedImage {
  file: File;
  uploadUrl: string;
  publicUrl: string;
  filename: string;
  uploaded: boolean;
}

export default function RequestPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    description: '',
    size: '',
    placement: '',
    preferredDates: '',
  });
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      // Get presigned URLs
      const response = await fetch('/api/uploads/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filenames: files.map(file => ({
            name: file.name,
            contentType: file.type,
          }))
        }),
      });

      if (!response.ok) throw new Error('Failed to get upload URLs');

      const { urls } = await response.json();

      const newImages: UploadedImage[] = files.map((file, index) => ({
        file,
        uploadUrl: urls[index].uploadUrl,
        publicUrl: urls[index].publicUrl,
        filename: urls[index].filename,
        uploaded: false,
      }));

      setImages(prev => [...prev, ...newImages]);

      // Upload images (mock upload for now)
      for (const image of newImages) {
        setTimeout(() => {
          setImages(prev =>
            prev.map(img =>
              img.filename === image.filename
                ? { ...img, uploaded: true }
                : img
            )
          );
        }, 1000);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  };

  const removeImage = (filename: string) => {
    setImages(prev => prev.filter(img => img.filename !== filename));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0 || !images.every(img => img.uploaded)) {
      alert('Please wait for all images to upload');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const preferredDatesArray = formData.preferredDates
        ? formData.preferredDates.split(',').map(date => date.trim()).filter(Boolean)
        : [];

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images: images.map(img => img.publicUrl),
          preferredDates: preferredDatesArray,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit request');

      setSubmitStatus('success');
      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        description: '',
        size: '',
        placement: '',
        preferredDates: '',
      });
      setImages([]);
    } catch (error) {
      console.error('Error submitting request:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Submit Tattoo Request</CardTitle>
            <CardDescription>
              Tell us about your tattoo idea and we'll get back to you soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800">Request submitted successfully! We'll be in touch soon.</p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">Error submitting request. Please try again.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your tattoo idea in detail..."
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="size">Size *</Label>
                  <Input
                    id="size"
                    name="size"
                    placeholder="e.g., 4x6 inches"
                    value={formData.size}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="placement">Placement *</Label>
                  <Input
                    id="placement"
                    name="placement"
                    placeholder="e.g., upper arm, back"
                    value={formData.placement}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="preferredDates">Preferred Dates (optional)</Label>
                <Input
                  id="preferredDates"
                  name="preferredDates"
                  placeholder="e.g., 2024-01-15, 2024-01-20"
                  value={formData.preferredDates}
                  onChange={handleInputChange}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Separate multiple dates with commas
                </p>
              </div>

              <div>
                <Label htmlFor="images">Reference Images *</Label>
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Upload reference images for your tattoo idea
                </p>
              </div>

              {images.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Images</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {images.map((image) => (
                      <div key={image.filename} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center">
                          {image.uploaded ? (
                            <Badge variant="default" className="text-xs">Uploaded</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Uploading...</Badge>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(image.filename)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                        <p className="text-xs text-gray-500 mt-1 truncate">{image.file.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || images.length === 0 || !images.every(img => img.uploaded)}
                className="w-full"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}