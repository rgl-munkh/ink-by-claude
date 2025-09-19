import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function TattooistDashboardPage() {
  const user = await getSession();

  if (!user) {
    redirect('/tattooist/login');
  }

  // Redirect to bookings page as the main dashboard
  redirect('/tattooist/bookings');
}