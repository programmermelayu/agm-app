import nodemailer from 'nodemailer';
import logger from '../config/logger.js';

// Email transporter configuration
let transporter;

/**
 * Initialize email transporter
 */
export function initializeTransporter() {
  if (process.env.NODE_ENV === 'production') {
    // Production: Use SendGrid or SMTP service
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development: Use Ethereal email (test email service)
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.ETHEREAL_USER || 'test@ethereal.email',
        pass: process.env.ETHEREAL_PASS || 'test_password',
      },
    });
  }

  logger.info('Email transporter initialized', {
    env: process.env.NODE_ENV,
    host: process.env.SMTP_HOST || 'ethereal',
  });
}

/**
 * Send invitation email
 * @param {object} params - Email parameters
 * @param {string} params.to - Recipient email
 * @param {string} params.agmName - AGM name
 * @param {string} params.agmDate - AGM date
 * @param {string} params.agmTime - AGM time
 * @param {string} params.rsvpToken - RSVP token
 * @returns {Promise<object>} - Email send result
 */
export async function sendInvitationEmail({
  to,
  agmName,
  agmDate,
  agmTime,
  rsvpToken,
}) {
  try {
    const rsvpLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/rsvp/${rsvpToken}`;

    const htmlContent = `
      <h2>You're invited to ${agmName}</h2>
      <p>
        <strong>Date:</strong> ${agmDate}<br>
        <strong>Time:</strong> ${agmTime}
      </p>
      <p>
        <a href="${rsvpLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          RSVP Now
        </a>
      </p>
      <p>Or copy this link: ${rsvpLink}</p>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@muktamar.local',
      to,
      subject: `Invitation: ${agmName}`,
      html: htmlContent,
      text: `You're invited to ${agmName} on ${agmDate} at ${agmTime}. Click here to RSVP: ${rsvpLink}`,
    };

    const result = await transporter.sendMail(mailOptions);

    logger.info('Invitation email sent', {
      to,
      agmName,
      messageId: result.messageId,
    });

    return {
      success: true,
      messageId: result.messageId,
      preview: result.preview,
    };
  } catch (error) {
    logger.error('Failed to send invitation email', {
      to,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Send RSVP confirmation email
 * @param {object} params - Email parameters
 * @param {string} params.to - Recipient email
 * @param {string} params.agmName - AGM name
 * @param {string} params.rsvpStatus - RSVP status (attending, not_attending, maybe)
 * @returns {Promise<object>} - Email send result
 */
export async function sendRSVPConfirmationEmail({ to, agmName, rsvpStatus }) {
  try {
    const statusText =
      rsvpStatus === 'attending'
        ? 'confirmed your attendance'
        : rsvpStatus === 'not_attending'
          ? 'confirmed you cannot attend'
          : 'marked as maybe';

    const htmlContent = `
      <h2>RSVP Confirmed</h2>
      <p>You have ${statusText} for <strong>${agmName}</strong>.</p>
      <p>Thank you for your response!</p>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@muktamar.local',
      to,
      subject: `RSVP Confirmed: ${agmName}`,
      html: htmlContent,
      text: `You have ${statusText} for ${agmName}. Thank you for your response!`,
    };

    const result = await transporter.sendMail(mailOptions);

    logger.info('RSVP confirmation email sent', {
      to,
      agmName,
      rsvpStatus,
      messageId: result.messageId,
    });

    return {
      success: true,
      messageId: result.messageId,
      preview: result.preview,
    };
  } catch (error) {
    logger.error('Failed to send RSVP confirmation email', {
      to,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Verify transporter connection
 */
export async function verifyTransporter() {
  try {
    await transporter.verify();
    logger.info('Email transporter verified successfully');
    return true;
  } catch (error) {
    logger.error('Failed to verify email transporter', {
      error: error.message,
    });
    return false;
  }
}

export default {
  initializeTransporter,
  sendInvitationEmail,
  sendRSVPConfirmationEmail,
  verifyTransporter,
};
