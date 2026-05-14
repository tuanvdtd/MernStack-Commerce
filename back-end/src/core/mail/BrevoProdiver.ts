import { BrevoClient } from '@getbrevo/brevo';
import { env } from '~/config/env'

console.log(env.BREVO_API_KEY);
const brevoClient = new BrevoClient({
  apiKey: env.BREVO_API_KEY,
  maxRetries: 3,
  timeoutInSeconds: 30
});

const sendEmail = async (recipientEmail: string, customSubject: string, htmlContent: string) => {
  const result = await brevoClient.transactionalEmails.sendTransacEmail({
    subject: customSubject,
    textContent: htmlContent,
    sender: { name: env.ADMIN_EMAIL_NAME, email: env.ADMIN_EMAIL_ADDRESS },
    to: [{ email: recipientEmail }]
  });
  return result;
}

export const BrevoProvider = {
  sendEmail
}