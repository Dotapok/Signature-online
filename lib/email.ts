import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import { Signer, Contract, User } from '@prisma/client';
import { config } from './config';
import { generateSignatureToken } from './jwt';
import { SignatureRequestEmail } from '../emails/signature-request';
import { SignatureCompletedEmail } from '../emails/signature-completed';

// Configure email transporter
const transporter = nodemailer.createTransport(config.email.server);

// Types
type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

/**
 * Send an email
 */
async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"${config.app.name}" <${config.email.from}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ''), // Fallback text version
      html,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Failed to send email');
  }
}

/**
 * Send a signature request email to a signer
 */
export async function sendSignatureRequest(
  signer: Signer & { contract: Contract & { owner: User } },
  baseUrl: string = config.app.url
): Promise<void> {
  const { name, email, contract } = signer;
  const signerName = name || email.split('@')[0];
  const ownerName = contract.owner.name || contract.owner.email.split('@')[0];
  
  // Generate a secure token for the signature link
  const token = generateSignatureToken(signer.id, signer.contractId, signer.email);
  const signatureUrl = `${baseUrl}/sign/${signer.contractId}?token=${token}`;

  // Render the email template
  const emailHtml = render(
    SignatureRequestEmail({
      signerName,
      ownerName,
      contractName: contract.title || 'Document à signer',
      signatureUrl,
    })
  );

  // Send the email
  await sendEmail({
    to: email,
    subject: `Signature requise : ${contract.title || 'Document important'}`,
    html: emailHtml,
  });

  console.log(`Signature request sent to ${email} for contract ${signer.contractId}`);
}

/**
 * Send a notification when a contract is fully signed
 */
export async function sendSignatureCompletedNotification(
  contract: Contract & { owner: User; signers: Signer[] },
  baseUrl: string = config.app.url
): Promise<void> {
  const { owner, title, signers } = contract;
  const ownerName = owner.name || owner.email.split('@')[0];
  
  // Send to contract owner
  const ownerEmailHtml = render(
    SignatureCompletedEmail({
      recipientName: ownerName,
      contractName: title || 'Document',
      contractUrl: `${baseUrl}/contracts/${contract.id}`,
      isOwner: true,
      signerCount: signers.length,
    })
  );

  await sendEmail({
    to: owner.email,
    subject: `Contrat signé : ${title || 'Document'}`,
    html: ownerEmailHtml,
  });

  console.log(`Signature completed notification sent to owner ${owner.email} for contract ${contract.id}`);

  // Send to all signers
  for (const signer of signers) {
    if (signer.email !== owner.email) {
      const signerName = signer.name || signer.email.split('@')[0];
      
      const signerEmailHtml = render(
        SignatureCompletedEmail({
          recipientName: signerName,
          contractName: title || 'Document',
          contractUrl: `${baseUrl}/contracts/${contract.id}`,
          isOwner: false,
          signerCount: signers.length,
        })
      );

      await sendEmail({
        to: signer.email,
        subject: `Contrat signé : ${title || 'Document'}`,
        html: signerEmailHtml,
      });

      console.log(`Signature completed notification sent to signer ${signer.email} for contract ${contract.id}`);
    }
  }
}

/**
 * Send a reminder to sign a document
 */
export async function sendSignatureReminder(
  signer: Signer & { contract: Contract & { owner: User } },
  baseUrl: string = config.app.url
): Promise<void> {
  const { name, email, contract } = signer;
  const signerName = name || email.split('@')[0];
  const ownerName = contract.owner.name || contract.owner.email.split('@')[0];
  
  // Generate a secure token for the signature link
  const token = generateSignatureToken(signer.id, signer.contractId, signer.email);
  const signatureUrl = `${baseUrl}/sign/${signer.contractId}?token=${token}`;

  // Render the email template
  const emailHtml = render(
    SignatureRequestEmail({
      signerName,
      ownerName,
      contractName: contract.title || 'Document à signer',
      signatureUrl,
      isReminder: true,
    })
  );

  // Send the email
  await sendEmail({
    to: email,
    subject: `Rappel : Signature requise - ${contract.title || 'Document important'}`,
    html: emailHtml,
  });

  console.log(`Signature reminder sent to ${email} for contract ${signer.contractId}`);
}
