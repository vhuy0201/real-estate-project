// src/utils/sendEmail.ts
import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: Number(process.env.MAIL_PORT) === 465,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Dwello App" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`Email đã gửi tới ${to}`);
  } catch (err) {
    console.error("Gửi email thất bại:", err);
    throw new Error("Không thể gửi email");
  }
};


export const sendResetPasswordEmail = async (email: string, fullName: string, link: string) => {
  const subject = "Reset your password";
  const html = `
    <p>Hi ${fullName},</p>
    <p>Click the link below to reset your password. This link expires in 15 minutes:</p>
    <a href="${link}">${link}</a>
  `;
  await sendEmail(email, subject, html);
};
