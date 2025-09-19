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

type SignatureCompletedEmailProps = {
  recipientName: string;
  contractName: string;
  contractUrl: string;
  isOwner: boolean;
  signerCount: number;
};

export function SignatureCompletedEmail({
  recipientName,
  contractName,
  contractUrl,
  isOwner,
  signerCount,
}: SignatureCompletedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Document signé : {contractName}</Preview>
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
            {isOwner ? 'Document signé par tous les participants' : 'Votre signature a été enregistrée'}
          </Heading>
          
          <Text style={paragraph}>Bonjour {recipientName},</Text>
          
          {isOwner ? (
            <>
              <Text style={paragraph}>
                Tous les signataires ont signé le document "{contractName}".
                Le document est maintenant complet et a été enregistré.
              </Text>
              
              <Text style={paragraph}>
                Nombre total de signataires : {signerCount}
              </Text>
              
              <Section style={buttonContainer}>
                <Button style={button} href={contractUrl}>
                  Télécharger le document signé
                </Button>
              </Section>
            </>
          ) : (
            <>
              <Text style={paragraph}>
                Nous vous confirmons que votre signature pour le document "{contractName}" a bien été enregistrée.
              </Text>
              
              <Text style={paragraph}>
                L'expéditeur a été notifié et recevra une copie du document une fois que tous les signataires auront apposé leur signature.
              </Text>
              
              <Section style={buttonContainer}>
                <Button style={button} href={contractUrl}>
                  Voir le document
                </Button>
              </Section>
            </>
          )}
          
          <Text style={paragraph}>
            Si vous avez des questions ou avez besoin d'aide, n'hésitez pas à répondre à cet email.
          </Text>
          
          <Text style={paragraph}>
            Cordialement,<br />
            L'équipe Signature Numérique Online
          </Text>
          
          <Hr style={hr} />
          
          <Text style={footer}>
            Vous recevez cet email car vous êtes impliqué dans un processus de signature électronique via Signature Numérique Online.
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

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: 1.5,
};
