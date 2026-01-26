import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface PaymentConfirmationEmailProps {
  nome: string;
  plano: string;
  valor: string;
  dataPagamento: string;
  proximaCobranca: string;
}

export const PaymentConfirmationEmail = ({ 
  nome, 
  plano, 
  valor, 
  dataPagamento,
  proximaCobranca 
}: PaymentConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Pagamento confirmado - Obrigado por assinar! ✅</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>✅ Pagamento Confirmado!</Heading>
        <Text style={text}>Olá, {nome}!</Text>
        <Text style={text}>
          Recebemos seu pagamento com sucesso! Obrigado por assinar o Turbo Gestor.
        </Text>
        
        <Section style={receiptBox}>
          <Text style={receiptTitle}>📄 Detalhes do Pagamento</Text>
          <table style={receiptTable}>
            <tr>
              <td style={receiptLabel}>Plano:</td>
              <td style={receiptValue}>{plano}</td>
            </tr>
            <tr>
              <td style={receiptLabel}>Valor:</td>
              <td style={receiptValue}>{valor}</td>
            </tr>
            <tr>
              <td style={receiptLabel}>Data do Pagamento:</td>
              <td style={receiptValue}>{dataPagamento}</td>
            </tr>
            <tr>
              <td style={receiptLabel}>Próxima Cobrança:</td>
              <td style={receiptValue}>{proximaCobranca}</td>
            </tr>
          </table>
        </Section>

        <Section style={successBox}>
          <Text style={successText}>
            🎉 Agora você tem acesso total ao Turbo Gestor!
          </Text>
          <ul style={featuresList}>
            <li>Clientes ilimitados</li>
            <li>Veículos ilimitados</li>
            <li>Controle completo de estoque</li>
            <li>Agendamentos e serviços</li>
            <li>Relatórios detalhados</li>
            <li>Suporte via email</li>
          </ul>
        </Section>

        <Section style={buttonContainer}>
          <Button style={button} href="https://turbogestor.com/dashboard">
            Acessar Dashboard
          </Button>
        </Section>

        <Hr style={hr} />

        <Text style={footer}>
          Precisa de ajuda? Entre em contato conosco respondendo este email.
        </Text>
        <Text style={footer}>
          A fatura detalhada foi enviada em anexo.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default PaymentConfirmationEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  borderRadius: '8px',
  maxWidth: '600px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 20px',
  textAlign: 'center' as const,
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const receiptBox = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  padding: '24px',
  margin: '24px 0',
  borderRadius: '8px',
};

const receiptTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 16px',
};

const receiptTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const receiptLabel = {
  color: '#6b7280',
  fontSize: '14px',
  padding: '8px 0',
  textAlign: 'left' as const,
};

const receiptValue = {
  color: '#1f2937',
  fontSize: '14px',
  fontWeight: 'bold',
  padding: '8px 0',
  textAlign: 'right' as const,
};

const successBox = {
  backgroundColor: '#ecfdf5',
  borderLeft: '4px solid #10b981',
  padding: '20px',
  margin: '24px 0',
  borderRadius: '4px',
};

const successText = {
  color: '#065f46',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const featuresList = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  paddingLeft: '20px',
  margin: '12px 0 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#10b981',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
  textAlign: 'center' as const,
};
