export const otpTemplate = (otp: string) => {
  return `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <p>Hi there,</p>
        <p>Your One-Time Password (OTP) is:</p>
        <h3 style="color: #333; font-size: 24px;">${otp}</h3>
        <p>This code will expire in 5 minutes.</p>
        <p>If you didn’t request this, you can safely ignore this email.</p>
        <br/>
        <p>Thanks,<br/>The Wallet Tracker Team</p>
      </div>
    `.trim();
};
