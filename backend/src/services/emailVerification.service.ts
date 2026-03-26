import EmailVerification from "../models/emailVerification.model";
import { sendEmail } from "../utils/sendEmail";
import User from "../models/user.model";

class EmailVerificationService {
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTP(userId: string, email: string) {
    const otp = this.generateOTP();

    await EmailVerification.deleteMany({ user_id: userId });

    await EmailVerification.create({
      user_id: userId,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    const html = `
      <h3>Mã xác thực Email</h3>
      <p>Mã OTP của bạn: <b>${otp}</b></p>
      <p>OTP có hiệu lực trong 10 phút.</p>
    `;

    await sendEmail(email, "Xác thực tài khoản", html);
  }

  async verifyOTP(userId: string, otp: string) {
    const record = await EmailVerification.findOne({ user_id: userId });
    if (!record) throw new Error("Không tìm thấy OTP, vui lòng gửi lại mã.");

    if (record.otp !== otp) throw new Error("OTP không chính xác.");
    if (record.expiresAt < new Date()) throw new Error("OTP đã hết hạn.");

    await User.findByIdAndUpdate(userId, { isVerified: true });
    await EmailVerification.deleteMany({ user_id: userId });

    return true;
  }
}

export const emailVerifyService = new EmailVerificationService();
