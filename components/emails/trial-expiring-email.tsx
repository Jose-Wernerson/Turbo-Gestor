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

interface TrialExpiringEmailProps {
  nome: string;
  diasRestantes: number;
}

export const TrialExpiringEmail = ({ nome, diasRestantes }: TrialExpiringEmailProps) => (
  <Html>
    <Head />
    <Preview>Seu período de teste expira em {diasRestantes} {diasRestantes === 1 ? 'dia' : 'dias'}! ⏰</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>⏰ Seu teste está acabando!</Heading>
        <Text style={text}>Olá, {nome}!</Text>
        <Text style={text}>
          Seu período de teste grátis de 7 dias expira em <strong style={warningText}>{diasRestantes} {diasRestantes === 1 ? 'dia' : 'dias'}</strong>.
        </Text>
        
        <Section style={warningBox}>
          <Text style={text}>
            Para continuar aproveitando todos os recursos do Turbo Gestor, escolha um dos nossos planos:
          </Text>
        </Section>

        <Section style={plansContainer}>
          <div style={planBox}>
            <Text style={planName}>💼 Plano Profissional</Text>
            <Text style={planPrice}>R$ 97/mês</Text>
            <ul style={planFeatures}>
              <li>Clientes ilimitados</li>
              <li>Veículos ilimitados</li>
              <li>Todos os recursos</li>
            </ul>
          </div>

          <div style={planBox}>
            <Text style={planName}>🚀 Plano Business</Text>
            <Text style={planPrice}>R$ 197/mês</Text>
            <ul style={planFeatures}>
              <li>Tudo do Profissional</li>
              <li>Recursos exclusivos</li>
              <li>Suporte prioritário</li>
            </ul>
          </div>
        </Section>

        <Section style={buttonContainer}>
          <Button style={button} href="https://turbogestor.com/dashboard/planos">
            Ver Planos e Assinar
          </Button>
        </Section>

        <Hr style={hr} />

        <Text style={footer}>
          Não perca o acesso! Assine agora e continue gerenciando sua oficina com eficiência.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default TrialExpiringEmail;

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

const warningText = {
  color: '#dc2626',
  fontWeight: 'bold',
};

const warningBox = {
  backgroundColor: '#fef2f2',
  borderLeft: '4px solid #ef4444',
  padding: '20px',
  margin: '24px 0',
  borderRadius: '4px',
};

const plansContainer = {
  display: 'grid',
  gap: '20px',
  margin: '24px 0',
};

const planBox = {
  border: '2px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  textAlign: 'center' as const,
};

const planName = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 8px',
};

const planPrice = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#3b82f6',
  margin: '8px 0 16px',
};

const planFeatures = {
  textAlign: 'left' as const,
  color: '#374151',
  fontSize: '14px',
  lineHeight: '20px',
  paddingLeft: '20px',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#ef4444',
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
