'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, User, Phone, Mail, Search, Filter } from 'lucide-react';

interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  slot: Date;
  durationMinutes: number;
  quotedAmount: number;
  depositAmount: number;
  status: 'reserved' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  reservationExpiresAt?: Date;
  createdAt: Date;
  tattooDescription?: string;
}

export default function BookingManagementPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockBookings: Booking[] = [
        {
          id: 'book_1',
          customerName: 'John Smith',
          customerPhone: '+1-555-0123',
          customerEmail: 'john@example.com',
          slot: new Date('2024-12-20T10:00:00'),
          durationMinutes: 120,
          quotedAmount: 300,
          depositAmount: 75,
          status: 'reserved',
          paymentStatus: 'unpaid',
          reservationExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
          createdAt: new Date('2024-09-18T15:30:00'),
          tattooDescription: 'Traditional dragon tattoo on forearm'
        },
        {
          id: 'book_2',
          customerName: 'Sarah Johnson',
          customerPhone: '+1-555-0456',
          customerEmail: 'sarah@example.com',
          slot: new Date('2024-12-22T14:00:00'),
          durationMinutes: 180,
          quotedAmount: 450,
          depositAmount: 112.5,
          status: 'confirmed',
          paymentStatus: 'paid',
          createdAt: new Date('2024-09-17T09:15:00'),
          tattooDescription: 'Geometric sleeve design with mandala elements'
        },
        {
          id: 'book_3',
          customerName: 'Mike Davis',
          customerPhone: '+1-555-0789',
          slot: new Date('2024-12-15T16:00:00'),
          durationMinutes: 90,
          quotedAmount: 200,
          depositAmount: 50,
          status: 'completed',
          paymentStatus: 'paid',
          createdAt: new Date('2024-09-10T12:00:00'),
          tattooDescription: 'Small minimalist design on wrist'
        }
      ];

      setBookings(mockBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.customerPhone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getBookingsByStatus = (status: string) => {
    if (status === 'all') return filteredBookings;
    return filteredBookings.filter(booking => booking.status === status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const isExpiringSoon = (booking: Booking) => {
    if (booking.status !== 'reserved' || !booking.reservationExpiresAt) return false;
    const timeLeft = booking.reservationExpiresAt.getTime() - Date.now();
    return timeLeft > 0 && timeLeft < 5 * 60 * 1000; // Less than 5 minutes
  };

  const isExpired = (booking: Booking) => {
    if (booking.status !== 'reserved' || !booking.reservationExpiresAt) return false;
    return booking.reservationExpiresAt.getTime() < Date.now();
  };

  const confirmBooking = async (bookingId: string) => {
    // Mock confirmation - replace with actual API call
    setBookings(prev => prev.map(booking =>
      booking.id === bookingId
        ? { ...booking, status: 'confirmed' as const, paymentStatus: 'paid' as const }
        : booking
    ));
  };

  const cancelBooking = async (bookingId: string) => {
    // Mock cancellation - replace with actual API call
    setBookings(prev => prev.map(booking =>
      booking.id === bookingId
        ? { ...booking, status: 'cancelled' as const }
        : booking
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p>Loading bookings...</p>
        </div>
      </div>
    );
  }

  const reservedBookings = getBookingsByStatus('reserved');
  const confirmedBookings = getBookingsByStatus('confirmed');
  const completedBookings = getBookingsByStatus('completed');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Management</h1>
          <p className="text-gray-600">Manage your appointments and client bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Reserved</p>
                  <p className="text-2xl font-bold text-gray-900">{reservedBookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Confirmed</p>
                  <p className="text-2xl font-bold text-gray-900">{confirmedBookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{completedBookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">$</div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${bookings.reduce((sum, booking) =>
                      booking.paymentStatus === 'paid' ? sum + booking.quotedAmount : sum, 0
                    ).toFixed(0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by customer name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent bg-white"
            >
              <option value="all">All Status</option>
              <option value="reserved">Reserved</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Bookings Tabs */}
        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({filteredBookings.length})</TabsTrigger>
            <TabsTrigger value="reserved">Reserved ({reservedBookings.length})</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed ({confirmedBookings.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <BookingsList
              bookings={filteredBookings}
              onConfirm={confirmBooking}
              onCancel={cancelBooking}
            />
          </TabsContent>

          <TabsContent value="reserved">
            <BookingsList
              bookings={reservedBookings}
              onConfirm={confirmBooking}
              onCancel={cancelBooking}
            />
          </TabsContent>

          <TabsContent value="confirmed">
            <BookingsList
              bookings={confirmedBookings}
              onConfirm={confirmBooking}
              onCancel={cancelBooking}
            />
          </TabsContent>

          <TabsContent value="completed">
            <BookingsList
              bookings={completedBookings}
              onConfirm={confirmBooking}
              onCancel={cancelBooking}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  function BookingsList({
    bookings,
    onConfirm,
    onCancel
  }: {
    bookings: Booking[],
    onConfirm: (id: string) => void,
    onCancel: (id: string) => void
  }) {
    if (bookings.length === 0) {
      return (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600">No bookings match your current filters.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card key={booking.id} className={`${isExpired(booking) ? 'opacity-60' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold">{booking.customerName}</h3>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                    <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                      {booking.paymentStatus}
                    </Badge>
                    {isExpiringSoon(booking) && (
                      <Badge className="bg-orange-100 text-orange-800">
                        Expires Soon
                      </Badge>
                    )}
                    {isExpired(booking) && (
                      <Badge className="bg-gray-100 text-gray-800">
                        Expired
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDateTime(booking.slot)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <Clock className="w-4 h-4 mr-2" />
                        {booking.durationMinutes} minutes
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {booking.customerPhone}
                      </div>
                      {booking.customerEmail && (
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Mail className="w-4 h-4 mr-2" />
                          {booking.customerEmail}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Total:</strong> ${booking.quotedAmount.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Deposit:</strong> ${booking.depositAmount.toFixed(2)}
                      </div>
                      {booking.reservationExpiresAt && booking.status === 'reserved' && (
                        <div className="text-sm text-gray-600">
                          <strong>Expires:</strong> {formatDateTime(booking.reservationExpiresAt)}
                        </div>
                      )}
                    </div>
                  </div>

                  {booking.tattooDescription && (
                    <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md mb-4">
                      <strong>Tattoo Description:</strong> {booking.tattooDescription}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {booking.status === 'reserved' && !isExpired(booking) && (
                      <>
                        <Button size="sm" onClick={() => onConfirm(booking.id)}>
                          Confirm Booking
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onCancel(booking.id)}>
                          Cancel
                        </Button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
}