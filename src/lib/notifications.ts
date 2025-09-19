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

interface OfferNotification {
  offerId: string;
  requestId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  quotedAmount: number;
  depositAmount: number;
  message: string;
  expiresAt?: Date;
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

export async function notifyOfferSent(notification: OfferNotification) {
  try {
    // Log notification (for now)
    console.log('💰 Offer Sent Notification', {
      offerId: notification.offerId,
      client: notification.clientName,
      contact: notification.clientPhone,
      quotedAmount: `$${notification.quotedAmount}`,
      depositAmount: `$${notification.depositAmount}`,
      expiresAt: notification.expiresAt?.toISOString(),
      offerLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/offers/${notification.offerId}`,
      timestamp: new Date().toISOString(),
    });

    // Future: Send email notification to client
    // await sendEmail({
    //   to: notification.clientEmail || notification.clientPhone + '@sms-email-gateway.com',
    //   subject: `Tattoo Quote Ready - $${notification.quotedAmount}`,
    //   html: generateOfferEmailTemplate(notification),
    // });

    // Future: Send SMS notification
    // await sendSMS({
    //   to: notification.clientPhone,
    //   message: `Your tattoo quote is ready! View it here: ${process.env.NEXT_PUBLIC_APP_URL}/offers/${notification.offerId}`,
    // });

    return { success: true };
  } catch (error) {
    console.error('Failed to send offer notification:', error);
    return { success: false, error };
  }
}

// Unused function - keeping for future email template feature
// function _generateRequestEmailTemplate(notification: NewRequestNotification): string {
//   return `
//     <h2>New Tattoo Request</h2>
//     <p><strong>Client:</strong> ${notification.name}</p>
//     <p><strong>Phone:</strong> ${notification.phone}</p>
//     ${notification.email ? `<p><strong>Email:</strong> ${notification.email}</p>` : ''}
//     <p><strong>Placement:</strong> ${notification.placement}</p>
//     <p><strong>Size:</strong> ${notification.size}</p>
//     <p><strong>Description:</strong></p>
//     <p>${notification.description}</p>
//     <p><strong>Images:</strong> ${notification.imageCount} uploaded</p>
//     <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/tattooist/requests/${notification.requestId}">View Request</a></p>
//   `;
// }

// Unused function - keeping for future email template feature  
// function _generateOfferEmailTemplate(notification: OfferNotification): string {
//   return `
//     <h2>Your Tattoo Quote is Ready!</h2>
//     <p>Hi ${notification.clientName},</p>
//     <p>Thank you for your tattoo request. Here are the details of your quote:</p>
//
//     <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
//       <h3>Quote Details</h3>
//       <p><strong>Total Amount:</strong> $${notification.quotedAmount}</p>
//       <p><strong>Required Deposit:</strong> $${notification.depositAmount}</p>
//       ${notification.expiresAt ? `<p><strong>Offer Expires:</strong> ${notification.expiresAt.toLocaleDateString()}</p>` : ''}
//     </div>
//
//     <h3>Message from your Artist:</h3>
//     <p>${notification.message}</p>
//
//     <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/offers/${notification.offerId}" style="background: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">View Full Offer & Book</a></p>
//
//     <p>Questions? Reply to this email or call us.</p>
//   `;
// }