
import { OtpService } from "./otp.service";
import transport from "~/dbs/init.nodemailer";
import { ResendProvider } from "~/provider/resendProvider";

const sendEmailLink = ({
  html,
  toEmail,
  subject = 'Xác thực tài khoản',
  text = 'Xác nhận...'
}) => {
  // Logic to send email with the provided link
  try {
    const maileOptions = {
      from: '"ShopDEV" <anonystick@gmail.com>',
      to: toEmail,
      subject,
      html,
      text
    }
    // transport.sendMail(maileOptions, (err, info) => {
    //   if (err) {
    //     console.error('Error sending email:', err);
    //   } else {
    //     console.log('Email sent successfully:', info.response);
    //   }
    // });
    ResendProvider.sendEmail({
      to: toEmail,
      subject,
      html
    });
  } catch (error) {
    throw error;
  }
}

const sendEmailToken = async ({
  email = null
}) => {
  try {
  // Create OTP record
  const otp = await OtpService.newOtp({ email });
  const verifyLink = `http://localhost:3055/v1/api/users/verify-token?token=${otp.otp_token}`;
  // Send email logic here
  sendEmailLink({
    toEmail: email,
    subject: 'Xác thực tài khoản',
    html: (function(){
      const mail = `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Xác nhận địa chỉ Email</title>
  </head>
  <body style="margin:0;padding:40px;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center">
          <table width="680" style="max-width:680px;background:#ffffff;border-radius:10px;padding:36px;text-align:center;box-shadow:0 6px 18px rgba(17,24,39,0.06);" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td>
                <div style="width:84px;height:84px;margin:0 auto 18px;border-radius:50%;background:linear-gradient(135deg,#eef2ff,#f6f8ff);display:flex;align-items:center;justify-content:center;">
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M3 8.5L12 13.5L21 8.5" stroke="#6C63FF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    <rect x="2" y="4" width="20" height="16" rx="3" stroke="#6C63FF" stroke-width="1.5" />
                  </svg>
                </div>
                <h1 style="font-size:28px;color:#111;margin:0 0 10px;">Xác nhận địa chỉ Email</h1>
                <p style="color:#556070;font-size:15px;line-height:1.6;margin:0 0 22px;">Bạn vừa tạo một tài khoản ShopDEV mới. Vui lòng xác nhận địa chỉ email của bạn để chúng tôi biết bạn là chủ sở hữu hợp pháp của tài khoản này.</p>
                <a href="${verifyLink}" style="display:inline-block;background:#6c63ff;color:#ffffff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:600;margin-bottom:14px;" target="_blank">Xác nhận địa chỉ email của tôi</a>
                <p style="color:#9aa4b2;font-size:12px;margin-top:20px;">Nếu bạn không yêu cầu việc này, bạn có thể bỏ qua email này.</p>
              </td>
            </tr>
          </table>
          <table width="680" style="max-width:680px;margin-top:18px;text-align:center;" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="color:#9aa4b2;font-size:13px;padding-top:8px;">Shop © 2025 Shop, Inc. All Rights Reserved.<br/>Hanoi 2025, Vietnam.</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
      return mail;
    })(),
    text: `Mã xác thực của bạn là: ${otp.otp_token}`
  });
  return otp;

  } catch (error) {
    throw error;
  }
}

export const EmailService = {
  sendEmailToken,
}