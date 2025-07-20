import nodemailer from 'nodemailer';

interface SendInviteEmailOptions {
  to: string;
  apartmentName: string;
  unitNo?: string;
  role: string;
  inviteLink: string;
  isNewUser: boolean;
  generatedPassword?: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendInviteEmail(options: SendInviteEmailOptions) {
  const { to, apartmentName, unitNo, role, inviteLink, isNewUser, generatedPassword } = options;
  const subject = `You're invited to join ${apartmentName} as ${role}`;
  let html = `<div style="font-family: sans-serif;">
    <h2>Welcome to ${apartmentName}!</h2>
    <p>You have been invited as a <b>${role}</b>${unitNo ? ` for unit <b>${unitNo}</b>` : ''}.</p>
    <p>Click the link below to accept your invite and join the platform:</p>
    <a href="${inviteLink}" style="display:inline-block;padding:10px 20px;background:#6366f1;color:#fff;text-decoration:none;border-radius:4px;">Accept Invite</a>
    <br/><br/>
    ${isNewUser && generatedPassword ? `<p><b>Your temporary password:</b> <code>${generatedPassword}</code></p><p>You will be asked to reset your password after first login.</p>` : ''}
    <p>If you did not expect this invitation, you can ignore this email.</p>
  </div>`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'no-reply@smarthive.app',
    to,
    subject,
    html,
  });
} 