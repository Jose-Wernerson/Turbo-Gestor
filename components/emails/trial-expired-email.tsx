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

interface TrialExpiredEmailProps {
  nome: string;
}

export const TrialExpiredEmail = ({ nome }: TrialExpiredEmailProps) => (
  <Html>
    <Head />
    <Preview>Seu período de teste expirou - Continue com Turbo Gestor! 🚀</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🚀 Continue sua jornada!</Heading>
        <Text style={text}>Olá, {nome}!</Text>
        <Text style={text}>
          Seu período de teste grátis de 7 dias chegou ao fim.
        </Text>
        
        <Section style={infoBox}>
          <Text style={text}>
            Esperamos que você tenha aproveitado para conhecer todos os recursos do Turbo Gestor!
          </Text>
          <Text style={text}>
            Para continuar gerenciando sua oficina com eficiência, escolha um plano que se adeque às suas necessidades:
          </Text>
        </Section>

        <Section style={offerBox}>
          <Text style={offerTitle}>🎁 Oferta Especial!</Text>
          <Text style={offerText}>
            Assine <strong>hoje</strong> e ganhe <strong style={discount}>20% de desconto</strong> no primeiro mês!
          </Text>
        </Section>

        <Section style={plansContainer}>
          <div style={planBox}>
            <Text style={planName}>💼 Profissional</Text>
            <Text style={planPriceOld}>R$ 97/mês</Text>
            <Text style={planPrice}>R$ 77,60/mês*</Text>
            <ul style={planFeatures}>
              <li>Clientes ilimitados</li>
              <li>Veículos ilimitados</li>
              <li>Todos os recursos</li>
            </ul>
          </div>

          <div style={planBoxHighlight}>
            <Text style={badge}>MAIS POPULAR</Text>
            <Text style={planName}>🚀 Business</Text>
            <Text style={planPriceOld}>R$ 197/mês</Text>
            <Text style={planPrice}>R$ 157,60/mês*</Text>
            <ul style={planFeatures}>
              <li>Tudo do Profissional</li>
              <li>Recursos exclusivos</li>
              <li>Suporte prioritário</li>
            </ul>
          </div>
        </Section>

        <Text style={disclaimer}>* Desconto válido apenas no primeiro mês</Text>

        <Section style={buttonContainer}>
          <Button style={button} href="https://turbogestor.com/dashboard/planos">
            Assinar Agora com Desconto
          </Button>
        </Section>

        <Hr style={hr} />

        <Text style={footer}>
          Não perca suas informações! Assine agora e mantenha o acesso a todos os seus dados.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default TrialExpiredEmail;

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

const infoBox = {
  backgroundColor: '#f3f4f6',
  padding: '20px',
  margin: '24px 0',
  borderRadius: '4px',
};

const offerBox = {
  backgroundColor: '#fef3c7',
  border: '2px solid #f59e0b',
  padding: '24px',
  margin: '24px 0',
  borderRadius: '8px',
  textAlign: 'center' as const,
};

const offerTitle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#92400e',
  margin: '0 0 12px',
};

const offerText = {
  fontSize: '18px',
  color: '#92400e',
  margin: '0',
};

const discount = {
  color: '#dc2626',
  fontSize: '20px',
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
  position: 'relative' as const,
};

const planBoxHighlight = {
  border: '2px solid #3b82f6',
  borderRadius: '8px',
  padding: '20px',
  textAlign: 'center' as const,
  position: 'relative' as const,
  backgroundColor: '#eff6ff',
};

const badge = {
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: 'bold',
  padding: '4px 12px',
  borderRadius: '12px',
  display: 'inline-block',
  marginBottom: '12px',
};

const planName = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 8px',
};

const planPriceOld = {
  fontSize: '16px',
  color: '#9ca3af',
  textDecoration: 'line-through',
  margin: '4px 0',
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

const disclaimer = {
  color: '#6b7280',
  fontSize: '12px',
  textAlign: 'center' as const,
  fontStyle: 'italic',
  margin: '8px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#f59e0b',
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
