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

interface WelcomeEmailProps {
  nome: string;
  email: string;
}

export const WelcomeEmail = ({ nome, email }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Bem-vindo ao Turbo Gestor! 🚗</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Bem-vindo ao Turbo Gestor! 🚗</Heading>
        <Text style={text}>Olá, {nome}!</Text>
        <Text style={text}>
          Estamos muito felizes em ter você conosco! Sua conta foi criada com sucesso.
        </Text>
        
        <Section style={highlightBox}>
          <Text style={highlightText}>
            ✨ <strong>7 dias de teste grátis</strong>
          </Text>
          <Text style={text}>
            Você tem acesso completo ao Plano Básico por 7 dias. Aproveite para:
          </Text>
          <ul style={list}>
            <li>Cadastrar até 50 clientes</li>
            <li>Gerenciar até 100 veículos</li>
            <li>Criar serviços e agendamentos</li>
            <li>Controlar seu estoque</li>
            <li>Gerar relatórios e faturas</li>
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
          Email: {email}
        </Text>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;

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

const highlightBox = {
  backgroundColor: '#eff6ff',
  borderLeft: '4px solid #3b82f6',
  padding: '20px',
  margin: '24px 0',
  borderRadius: '4px',
};

const highlightText = {
  color: '#1e40af',
  fontSize: '18px',
  margin: '0 0 12px',
};

const list = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  paddingLeft: '20px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#3b82f6',
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
