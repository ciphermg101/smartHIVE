import nodemailer from 'nodemailer';
import { AppException } from '@common/error-handler/errorHandler';
import { config } from '@config/configs';
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
  host: config.smtp.host,
  port: Number(config.smtp.port) || 587,
  secure: true,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
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

  try {
    await transporter.sendMail({
      from: config.smtp.from || 'no-reply@smarthive.app',
      to,
      subject,
      html,
    });
  } catch (error: any) {
    throw new AppException(error, error.message, error.status);
  }
}