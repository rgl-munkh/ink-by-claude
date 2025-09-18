interface NewRequestNotification {
  requestId: string;
  name: string;
  phone: string;
  email?: string;
  description: string;
  size: string;
  placement: string;
  imageCount: number;
}

export async function notifyNewRequest(notification: NewRequestNotification) {
  try {
    // Log notification (for now)
    console.log('📨 New Tattoo Request Notification', {
      id: notification.requestId,
      client: notification.name,
      contact: notification.phone,
      description: notification.description.substring(0, 100) + '...',
      placement: notification.placement,
      size: notification.size,
      images: notification.imageCount,
      timestamp: new Date().toISOString(),
    });

    // Future: Send email notification
    // await sendEmail({
    //   to: process.env.TATTOOIST_EMAIL,
    //   subject: `New Tattoo Request from ${notification.name}`,
    //   html: generateRequestEmailTemplate(notification),
    // });

    // Future: Send SMS notification
    // await sendSMS({
    //   to: process.env.TATTOOIST_PHONE,
    //   message: `New tattoo request from ${notification.name}. Check your dashboard.`,
    // });

    return { success: true };
  } catch (error) {
    console.error('Failed to send notification:', error);
    return { success: false, error };
  }
}

function generateRequestEmailTemplate(notification: NewRequestNotification): string {
  return `
    <h2>New Tattoo Request</h2>
    <p><strong>Client:</strong> ${notification.name}</p>
    <p><strong>Phone:</strong> ${notification.phone}</p>
    ${notification.email ? `<p><strong>Email:</strong> ${notification.email}</p>` : ''}
    <p><strong>Placement:</strong> ${notification.placement}</p>
    <p><strong>Size:</strong> ${notification.size}</p>
    <p><strong>Description:</strong></p>
    <p>${notification.description}</p>
    <p><strong>Images:</strong> ${notification.imageCount} uploaded</p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/tattooist/requests/${notification.requestId}">View Request</a></p>
  `;
}