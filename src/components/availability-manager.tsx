'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface AvailabilityBlock {
  id: string;
  startTime: Date;
  endTime: Date;
  isBooked: boolean;
  note?: string | null;
  createdAt: Date;
}

export function AvailabilityManager() {
  const [availabilityBlocks, setAvailabilityBlocks] = useState<AvailabilityBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<AvailabilityBlock | null>(null);

  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    note: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const response = await fetch('/api/tattooist/availability');
      const data = await response.json();

      if (data.success) {
        const blocks = data.availability.map((block: {
          id: string;
          startTime: string;
          endTime: string;
          isBooked: boolean;
          note?: string | null;
          createdAt: string;
        }) => ({
          ...block,
          startTime: new Date(block.startTime),
          endTime: new Date(block.endTime),
          createdAt: new Date(block.createdAt),
        }));
        setAvailabilityBlocks(blocks);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ startTime: '', endTime: '', note: '' });
    setError(null);
    setEditingBlock(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const url = editingBlock
        ? `/api/tattooist/availability/${editingBlock.id}`
        : '/api/tattooist/availability';

      const method = editingBlock ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save availability');
      }

      await fetchAvailability();
      setIsCreateOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (block: AvailabilityBlock) => {
    setEditingBlock(block);
    setFormData({
      startTime: format(block.startTime, "yyyy-MM-dd'T'HH:mm"),
      endTime: format(block.endTime, "yyyy-MM-dd'T'HH:mm"),
      note: block.note || '',
    });
    setIsCreateOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this availability block?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tattooist/availability/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete availability');
      }

      await fetchAvailability();
    } catch (error) {
      console.error('Error deleting availability:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete availability');
    }
  };

  const handleCreateNew = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Availability Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading availability...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Availability Management
          </span>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateNew} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Availability
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingBlock ? 'Edit Availability' : 'Create Availability Block'}
                </DialogTitle>
                <DialogDescription>
                  Set your available hours for appointments.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note">Note (optional)</Label>
                  <Textarea
                    id="note"
                    placeholder="Add any notes about this availability..."
                    value={formData.note}
                    onChange={(e) =>
                      setFormData({ ...formData, note: e.target.value })
                    }
                  />
                </div>
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                    {error}
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? 'Saving...'
                      : editingBlock
                      ? 'Update'
                      : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
        <CardDescription>
          Manage your available time slots for appointments
        </CardDescription>
      </CardHeader>
      <CardContent>
        {availabilityBlocks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No availability blocks configured.</p>
            <p className="text-sm">Add your first availability block to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {availabilityBlocks.map((block) => (
              <div
                key={block.id}
                className={`p-4 border rounded-lg ${
                  block.isBooked ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">
                          {format(block.startTime, 'MMM d, yyyy HH:mm')} -{' '}
                          {format(block.endTime, 'HH:mm')}
                        </p>
                        <p className="text-sm text-gray-600">
                          Duration:{' '}
                          {Math.round(
                            (block.endTime.getTime() - block.startTime.getTime()) /
                              (1000 * 60)
                          )}{' '}
                          minutes
                        </p>
                      </div>
                      {block.isBooked && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                          Booked
                        </span>
                      )}
                    </div>
                    {block.note && (
                      <p className="text-sm text-gray-600 mt-2">{block.note}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(block)}
                      disabled={block.isBooked}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(block.id)}
                      disabled={block.isBooked}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}