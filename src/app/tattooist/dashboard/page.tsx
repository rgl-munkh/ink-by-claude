import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AvailabilityManager } from '@/components/availability-manager';

async function LogoutButton() {
  async function handleLogout() {
    'use server';

    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/tattooist/logout`, {
      method: 'POST',
    });

    redirect('/tattooist/login');
  }

  return (
    <form action={handleLogout}>
      <Button variant="outline" type="submit">
        Logout
      </Button>
    </form>
  );
}

export default async function TattooistDashboardPage() {
  const user = await getSession();

  if (!user) {
    redirect('/tattooist/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="flex h-16 items-center justify-between px-6">
          <h1 className="text-xl font-semibold">Tattooist Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {user.username}</span>
            <LogoutButton />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <AvailabilityManager />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Bookings</CardTitle>
              <CardDescription>Manage your appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                View and manage your upcoming appointments and booking requests.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Portfolio</CardTitle>
              <CardDescription>Showcase your work</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Upload and manage your tattoo portfolio images.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Availability</CardTitle>
              <CardDescription>Set your schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Configure your available days and hours for appointments.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your information</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Edit your bio and professional information.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payments</CardTitle>
              <CardDescription>Track transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                View payment history and manage deposits.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Business insights</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                View booking statistics and revenue reports.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}