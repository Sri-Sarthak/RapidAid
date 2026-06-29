const nodemailer = require("nodemailer");

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    // No SMTP credentials configured - we'll fall back to console logging
    // so the rest of the app keeps working during development/demo.
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
};

/**
 * Sends a single email. Falls back to console logging if SMTP
 * credentials aren't configured, so local/demo usage never crashes.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const tx = getTransporter();

  if (!tx) {
    console.log("\n--- EMAIL (SMTP not configured, logging instead) ---");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(text || html);
    console.log("-----------------------------------------------------\n");
    return { logged: true };
  }

  try {
    const info = await tx.sendMail({
      from: process.env.EMAIL_FROM || '"Accident SOS Alert" <no-reply@accidentsos.app>',
      to,
      subject,
      text,
      html,
    });
    return info;
  } catch (err) {
    console.error(`Failed to send email to ${to}:`, err.message);
    return { error: err.message };
  }
};

/**
 * Builds and sends the "SOS triggered" email to a family member,
 * including a clickable live-location link.
 */
const sendSOSEmail = async ({ to, victimName, lat, lng, message }) => {
  const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;

  const subject = `🚨 EMERGENCY: ${victimName} needs help - SOS Alert`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; border: 1px solid #fee2e2; border-radius: 8px; overflow: hidden;">
      <div style="background:#DC2626; color:#fff; padding:16px 20px;">
        <h2 style="margin:0;">🚨 Emergency SOS Alert</h2>
      </div>
      <div style="padding:20px; color:#1e293b;">
        <p><strong>${victimName}</strong> has triggered an SOS alert and may need immediate help.</p>
        ${message ? `<p style="background:#f1f5f9;padding:10px;border-radius:6px;">${message}</p>` : ""}
        <p>Their live location at the time of the alert:</p>
        <p>
          <a href="${mapsLink}" target="_blank" style="display:inline-block;background:#0F766E;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:bold;">
            View Live Location on Map
          </a>
        </p>
        <p style="font-size:13px;color:#64748b;">Coordinates: ${lat}, ${lng}</p>
        <p style="font-size:13px;color:#64748b;">Please try contacting them immediately and consider calling local emergency services.</p>
      </div>
    </div>
  `;

  const text = `EMERGENCY SOS ALERT\n\n${victimName} has triggered an SOS alert.\n${
    message ? `Message: ${message}\n` : ""
  }Live location: ${mapsLink}\nCoordinates: ${lat}, ${lng}`;

  return sendEmail({ to, subject, html, text });
};

module.exports = { sendEmail, sendSOSEmail };
