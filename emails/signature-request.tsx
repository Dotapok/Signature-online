import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

type SignatureRequestEmailProps = {
  signerName: string;
  ownerName: string;
  contractName: string;
  signatureUrl: string;
  isReminder?: boolean;
};

export function SignatureRequestEmail({
  signerName,
  ownerName,
  contractName,
  signatureUrl,
  isReminder = false,
}: SignatureRequestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {isReminder ? 'Rappel : ' : ''}Signature requise pour {contractName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/logo.png`}
              width="120"
              height="40"
              alt="Signature Numérique Online"
            />
          </Section>
          
          <Heading style={heading}>
            {isReminder ? 'Rappel : ' : ''}Signature requise pour {contractName}
          </Heading>
          
          <Text style={paragraph}>Bonjour {signerName},</Text>
          
          <Text style={paragraph}>
            {ownerName} vous a demandé de signer le document "{contractName}".
          </Text>
          
          <Section style={buttonContainer}>
            <Button style={button} href={signatureUrl}>
              Voir et signer le document
            </Button>
          </Section>
          
          <Text style={paragraph}>
            Si le bouton ne fonctionne pas, copiez et collez le lien suivant dans votre navigateur :
          </Text>
          
          <code style={code}>{signatureUrl}</code>
          
          <Text style={paragraph}>
            Ce lien est valable 7 jours. Après cette date, le document expirera et une nouvelle demande de signature sera nécessaire.
          </Text>
          
          <Text style={paragraph}>
            Cordialement,<br />
            L'équipe Signature Numérique Online
          </Text>
          
          <Hr style={hr} />
          
          <Text style={footer}>
            Vous recevez cet email car {ownerName} vous a invité à signer un document via Signature Numérique Online.
            Si vous pensez avoir reçu cet email par erreur, vous pouvez l'ignorer en toute sécurité.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
};

const logoContainer = {
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const heading = {
  fontSize: '24px',
  lineHeight: 1.3,
  fontWeight: '700',
  color: '#1a1a1a',
  margin: '16px 0',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: 1.4,
  color: '#3c4149',
  margin: '16px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px 24px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const code = {
  fontFamily: 'monospace',
  fontSize: '14px',
  backgroundColor: '#f4f4f5',
  padding: '12px',
  borderRadius: '4px',
  wordBreak: 'break-all' as const,
  display: 'block',
  margin: '16px 0',
};

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: 1.5,
};
