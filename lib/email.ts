import { Resend } from 'resend';
import { WelcomeEmail } from '@/components/emails/welcome-email';
import { TrialExpiringEmail } from '@/components/emails/trial-expiring-email';
import { TrialExpiredEmail } from '@/components/emails/trial-expired-email';
import { PaymentConfirmationEmail } from '@/components/emails/payment-confirmation-email';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailResult {
  success: boolean;
  error?: string;
}

export async function sendWelcomeEmail(
  email: string,
  nome: string
): Promise<SendEmailResult> {
  try {
    await resend.emails.send({
      from: 'Turbo Gestor <onboarding@turbogestor.com>',
      to: [email],
      subject: 'Bem-vindo ao Turbo Gestor! 🚗',
      react: WelcomeEmail({ nome, email }),
    });

    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar email de boas-vindas:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}

export async function sendTrialExpiringEmail(
  email: string,
  nome: string,
  diasRestantes: number
): Promise<SendEmailResult> {
  try {
    await resend.emails.send({
      from: 'Turbo Gestor <noreply@turbogestor.com>',
      to: [email],
      subject: `⏰ Seu teste expira em ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}!`,
      react: TrialExpiringEmail({ nome, diasRestantes }),
    });

    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar email de trial expirando:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}

export async function sendTrialExpiredEmail(
  email: string,
  nome: string
): Promise<SendEmailResult> {
  try {
    await resend.emails.send({
      from: 'Turbo Gestor <noreply@turbogestor.com>',
      to: [email],
      subject: '🚀 Continue sua jornada com Turbo Gestor!',
      react: TrialExpiredEmail({ nome }),
    });

    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar email de trial expirado:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}

export async function sendPaymentConfirmationEmail(
  email: string,
  nome: string,
  plano: string,
  valor: string,
  dataPagamento: string,
  proximaCobranca: string
): Promise<SendEmailResult> {
  try {
    await resend.emails.send({
      from: 'Turbo Gestor <pagamentos@turbogestor.com>',
      to: [email],
      subject: '✅ Pagamento Confirmado - Turbo Gestor',
      react: PaymentConfirmationEmail({ 
        nome, 
        plano, 
        valor, 
        dataPagamento, 
        proximaCobranca 
      }),
    });

    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar email de confirmação de pagamento:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}
