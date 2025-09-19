'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Clock, Calendar } from 'lucide-react';

interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  availabilityBlockId: string;
  note?: string;
}

interface BookingCalendarProps {
  artistId: string;
  onSlotSelect: (slot: TimeSlot) => void;
  selectedSlot?: TimeSlot | null;
}

export default function BookingCalendar({ artistId, onSlotSelect, selectedSlot }: BookingCalendarProps) {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const fetchAvailability = useCallback(async () => {
    try {
      const response = await fetch(`/api/artist/${artistId}/availability`);
      if (!response.ok) throw new Error('Failed to fetch availability');

      const data = await response.json();
      setAvailableSlots(data.availableSlots.map((slot: { id: string; startTime: string; endTime: string; duration: number; availabilityBlockId: string; note?: string }) => ({
        ...slot,
        startTime: new Date(slot.startTime),
        endTime: new Date(slot.endTime),
      })));
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  }, [artistId]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const getMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    // const lastDay = new Date(year, month + 1, 0); // Unused variable
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    while (days.length < 42) { // 6 weeks
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const getSlotsForDate = (date: Date) => {
    const dateString = date.toDateString();
    return availableSlots.filter(slot =>
      slot.startTime.toDateString() === dateString
    ).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  };

  const hasAvailabilityOnDate = (date: Date) => {
    return getSlotsForDate(date).length > 0;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
    setSelectedDate(null);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 28 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const days = getDaysInMonth(currentDate);
  const slotsForSelectedDate = selectedDate ? getSlotsForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Select Date
              </CardTitle>
              <CardDescription>Choose an available date for your appointment</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-medium min-w-[140px] text-center">
                {getMonthYear(currentDate)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const hasAvailability = hasAvailabilityOnDate(day);
              const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();
              const isPast = isPastDate(day);
              const isTodayDate = isToday(day);

              return (
                <button
                  key={index}
                  onClick={() => isCurrentMonth && hasAvailability && !isPast ? setSelectedDate(day) : null}
                  disabled={!isCurrentMonth || !hasAvailability || isPast}
                  className={`
                    aspect-square p-1 text-sm rounded-md transition-colors relative
                    ${!isCurrentMonth ? 'text-gray-300' : ''}
                    ${isPast ? 'text-gray-400 cursor-not-allowed' : ''}
                    ${hasAvailability && !isPast && isCurrentMonth ? 'hover:bg-blue-50 cursor-pointer' : ''}
                    ${isSelected ? 'bg-black text-white hover:bg-gray-800' : ''}
                    ${isTodayDate && !isSelected ? 'bg-blue-100 text-blue-900' : ''}
                    ${!hasAvailability && isCurrentMonth && !isPast ? 'text-gray-400' : ''}
                  `}
                >
                  <span>{day.getDate()}</span>
                  {hasAvailability && isCurrentMonth && !isPast && (
                    <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-green-500'
                    }`}></div>
                  )}
                </button>
              );
            })}
          </div>

          {availableSlots.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No availability found. The artist may not have set up their schedule yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time Slots */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Available Times
            </CardTitle>
            <CardDescription>
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {slotsForSelectedDate.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No available time slots for this date.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {slotsForSelectedDate.map(slot => (
                  <button
                    key={slot.id}
                    onClick={() => onSlotSelect(slot)}
                    className={`
                      p-3 border rounded-lg text-left transition-colors
                      ${selectedSlot?.id === slot.id
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="font-medium">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </div>
                    <div className="text-sm opacity-75">
                      {slot.duration} minutes
                    </div>
                    {slot.note && (
                      <Badge variant="secondary" className="text-xs mt-2">
                        {slot.note}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}