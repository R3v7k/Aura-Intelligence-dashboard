import React, { useState, useEffect } from 'react';
import BrevoCopilot from './BrevoCopilot';
import AuditLogModal from './AuditLogModal';
import { ChatBackupsModal } from './ChatBackupsModal';
import { ObservabilityNexus } from './ObservabilityNexus';
import { Modal } from './Modal';
import ReactMarkdown from 'react-markdown';
import { Activity, MessageSquare, Terminal, Bot, Target, Layers } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [webhookStatus, setWebhookStatus] = useState('Checking...');
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isChatBackupsOpen, setIsChatBackupsOpen] = useState(false);
  const [isNexusOpen, setIsNexusOpen] = useState(false);
  const [isCartAbandonmentSlideOpen, setIsCartAbandonmentSlideOpen] = useState(false);
  const [isSmsFallbackSlideOpen, setIsSmsFallbackSlideOpen] = useState(false);
  const [isPaymentFailureSlideOpen, setIsPaymentFailureSlideOpen] = useState(false);
  
  // Modals for other modules
  const [isStrategyPlannerOpen, setIsStrategyPlannerOpen] = useState(false);

  const [customerState, setCustomerState] = useState({
    intent: 'Browsing',
    engagementScore: 85,
    likelihoodToConvert: 72,
    preferredChannel: 'Email'
  });
  const [strategyCommand, setStrategyCommand] = useState('');
  const [strategy, setStrategy] = useState('');
  const [events, setEvents] = useState<string[]>([]);
  const [telemetry, setTelemetry] = useState({ sent: 0, delivered: 0, opened: 0 });
  const [logs, setLogs] = useState<string[]>([]);
  const [lastPayload, setLastPayload] = useState<string>('');

  useEffect(() => {
    fetch('/api/webhookStatus').then(res => res.json()).then(data => setWebhookStatus(data.url));
  }, []);

  const executeDefaultCartAbandonment = async () => {
    try {
      const email = 'brevolv@gmail.com';
      const fName = 'Luis';
      const lName = '';
      const cName = 'Brevo';
      const payload = { email, event: 'cart_updated', properties: { cart_status: 'abandoned', cart_value: '149.00', product_name: 'Soundcore Space One Pro', first_name: fName, last_name: lName, company_name: cName } };
      
      setEvents(prev => [`cart_updated: abandoned (${email})`, ...prev]);
      setLogs(prev => [...prev, '> [AURA AI] Intercepted event: cart_updated', '> [EXPLAINABLE AI] Escalating to Email.']);
      const trackRes = await fetch('/api/trackEvent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ payload }) });
      const trackData = await trackRes.json();
      
      const emailPayload = { 
        sender: { name: 'Luis Brevo Demo', email: 'brevolv@gmail.com' }, 
        to: [{ email: email, name: `${fName} ${lName}`.trim() }], 
        subject: `${fName}! You left something in your cart`, 
        htmlContent: `
          <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 24px; border: 1px solid #d9d9d9;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://cdn.prod.website-files.com/6504b2c6bf98b084e15456f8/65a3c9727a94950c7e02b160_Main-min.jpg" alt="Brand Banner" style="width: 150px; border-radius: 8px;" />
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 20px; background: #ffffff; padding: 20px; border-radius: 16px; border: 1px solid #e3e3e3;">
              <img src="https://media.licdn.com/dms/image/v2/D4E03AQFcI3TrrDKvaA/profile-displayphoto-scale_400_400/B4EZxmzdnfJMAg-/0/1771251298629?e=1776297600&v=beta&t=0A4A_gOWlnR9QaAJBSbMRQCDdoJwT1M-odIawqUAGA4" alt="${fName}" style="width: 64px; height: 64px; border-radius: 50%; margin-right: 20px; border: 2px solid #0b996f; object-fit: cover;" />
              <h1 style="color: #1b1b1b; margin: 0; font-size: 20px; font-weight: 700;">${fName}! You left something in your cart</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border-radius: 16px; text-align: center; border: 1px solid #e3e3e3;">
              <img src="https://cdn.shopify.com/s/files/1/0516/3761/6830/files/A3062Z11_DTC_listing_image_en_01_1600_1600_V3_3707d698-e24e-4e85-8786-302a61763c93_3840x.png?v=1770177254" alt="Soundcore Space One Pro" style="width: 200px; display: block; margin: 0 auto 20px;" />
              <p style="font-size: 16px; color: #474747; margin-bottom: 25px; line-height: 1.5;">The <b>Soundcore Space One Pro</b> is waiting for you. Experience premium sound for only $149.00.</p>
              <a href="https://www.soundcore.com/products/a3062-noise-cancelling-headphones?ref=cart&_gl=1*1p4am75*_up*MQ..*_gs*MQ..&gclid=Cj0KCQjwm6POBhCrARIsAIG58CJEp7GfEV_9_isPPTtaEKNTPf99Vadv-e4WeUVy0bmrv-5jE9h41mwaAmPrEALw_wcB&gbraid=0AAAAACRxuSKjFRZuet5TuN96YRLBVk4uL" style="background-color: #0b996f; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 32px; display: inline-block; font-weight: 700; font-size: 16px;">Complete your purchase</a>
            </div>
            <div style="margin-top: 30px; text-align: center; color: #696969; font-size: 14px;">
              <p>Best,<br/><b style="color: #1b1b1b;">Luis Villeda</b><br/>Sales Engineer</p>
            </div>
          </div>
        ` 
      };
      const emailRes = await fetch('/api/sendEmail', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ payload: emailPayload }) });
      const emailData = await emailRes.json();
      setLastPayload(JSON.stringify({ request: payload, response: { trackEvent: { status: trackRes.status, data: trackData }, email: { status: emailRes.status, data: emailData } } }, null, 2));
      setTelemetry(prev => ({ ...prev, sent: prev.sent + 1, delivered: prev.delivered + 1 }));
    } catch (error) {
      console.error(error);
      setLastPayload(JSON.stringify({ error: String(error) }, null, 2));
    }
  };

  const executeLiveCartAbandonment = async () => {
    try {
      const email = recipientEmail || 'brevolv@gmail.com';
      const fName = firstName || 'Luis';
      const lName = lastName || '';
      const cName = companyName || 'Brevo';
      const payload = { email, event: 'cart_updated', properties: { cart_status: 'abandoned', cart_value: '149.00', product_name: 'Soundcore Space One Pro', first_name: fName, last_name: lName, company_name: cName } };
      
      setEvents(prev => [`cart_updated: abandoned (${email})`, ...prev]);
      setLogs(prev => [...prev, '> [AURA AI] Intercepted event: cart_updated', '> [EXPLAINABLE AI] Escalating to Email.']);
      const trackRes = await fetch('/api/trackEvent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ payload }) });
      const trackData = await trackRes.json();
      
      const emailPayload = { 
        sender: { name: 'Luis Brevo Demo', email: 'brevolv@gmail.com' }, 
        to: [{ email: email, name: `${fName} ${lName}`.trim() }], 
        subject: `${fName}! You left something in your cart`, 
        htmlContent: `
          <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 24px; border: 1px solid #d9d9d9;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://cdn.prod.website-files.com/6504b2c6bf98b084e15456f8/65a3c9727a94950c7e02b160_Main-min.jpg" alt="Brand Banner" style="width: 150px; border-radius: 8px;" />
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 20px; background: #ffffff; padding: 20px; border-radius: 16px; border: 1px solid #e3e3e3;">
              <img src="${customImage || 'https://media.licdn.com/dms/image/v2/D4E03AQFcI3TrrDKvaA/profile-displayphoto-scale_400_400/B4EZxmzdnfJMAg-/0/1771251298629?e=1776297600&v=beta&t=0A4A_gOWlnR9QaAJBSbMRQCDdoJwT1M-odIawqUAGA4'}" alt="${fName}" style="width: 64px; height: 64px; border-radius: 50%; margin-right: 20px; border: 2px solid #0b996f; object-fit: cover;" />
              <h1 style="color: #1b1b1b; margin: 0; font-size: 20px; font-weight: 700;">${fName}! You left something in your cart</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border-radius: 16px; text-align: center; border: 1px solid #e3e3e3;">
              <img src="https://cdn.shopify.com/s/files/1/0516/3761/6830/files/A3062Z11_DTC_listing_image_en_01_1600_1600_V3_3707d698-e24e-4e85-8786-302a61763c93_3840x.png?v=1770177254" alt="Soundcore Space One Pro" style="width: 200px; display: block; margin: 0 auto 20px;" />
              <p style="font-size: 16px; color: #474747; margin-bottom: 25px; line-height: 1.5;">The <b>Soundcore Space One Pro</b> is waiting for you. Experience premium sound for only $149.00.</p>
              <a href="https://www.soundcore.com/products/a3062-noise-cancelling-headphones?ref=cart&_gl=1*1p4am75*_up*MQ..*_gs*MQ..&gclid=Cj0KCQjwm6POBhCrARIsAIG58CJEp7GfEV_9_isPPTtaEKNTPf99Vadv-e4WeUVy0bmrv-5jE9h41mwaAmPrEALw_wcB&gbraid=0AAAAACRxuSKjFRZuet5TuN96YRLBVk4uL" style="background-color: #0b996f; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 32px; display: inline-block; font-weight: 700; font-size: 16px;">Complete your purchase</a>
            </div>
            <div style="margin-top: 30px; text-align: center; color: #696969; font-size: 14px;">
              <p>Best,<br/><b style="color: #1b1b1b;">Luis Villeda</b><br/>Sales Engineer</p>
            </div>
          </div>
        ` 
      };
      const emailRes = await fetch('/api/sendEmail', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ payload: emailPayload }) });
      const emailData = await emailRes.json();
      setLastPayload(JSON.stringify({ request: payload, response: { trackEvent: { status: trackRes.status, data: trackData }, email: { status: emailRes.status, data: emailData } } }, null, 2));
      setTelemetry(prev => ({ ...prev, sent: prev.sent + 1, delivered: prev.delivered + 1 }));
    } catch (error) {
      console.error(error);
      setLastPayload(JSON.stringify({ error: String(error) }, null, 2));
    }
  };

  const executeLivePaymentFailure = async () => {
    try {
      const email = recipientEmail || 'brevolv@gmail.com';
      const phone = recipientPhone ? (recipientPhone.startsWith('+') ? recipientPhone : `+1${recipientPhone.replace(/\D/g, '')}`) : '+16179554170';
      const fName = firstName || 'Luis';
      const lName = lastName || 'Villeda';
      const cName = companyName || 'Brevo';
      const amount = '$149.00';
      const service = 'Soundcore Space One Pro';
      
      const payload = { email, phone, event: 'payment_failed', properties: { cart_value: '149.00', product_name: service, first_name: fName, last_name: lName, company_name: cName } };
      
      setEvents(prev => [`payment_failed: (${email})`, ...prev]);
      setLogs(prev => [...prev, '> [EVENT] payment_failed received.', '> [AURA AI] Escalating to Email & SMS.']);
      
      const res = await fetch('/api/simulatePaymentFailure', { method: 'POST' });
      const data = await res.json();
      data.actions.forEach((a: string) => setLogs(prev => [...prev, `> [AUTONOMOUS ACTION] ${a}`]));

      const emailPayload = {
        sender: { name: 'Aura Billing', email: 'brevolv@gmail.com' },
        to: [{ email: email, name: `${fName} ${lName}`.trim() }],
        subject: `Action required: Payment for ${service} failed`,
        htmlContent: `<div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 24px; border: 1px solid #d9d9d9;"><div style="text-align: center; margin-bottom: 20px;"><img src="https://framerusercontent.com/images/U0VltHCCefV5vWu8znLfThpPx0.png" alt="Payment Failed" style="width: 100%; max-width: 400px; border-radius: 8px;" /></div><div style="background: #ffffff; padding: 30px; border-radius: 16px; border: 1px solid #e3e3e3;"><p style="font-size: 16px; color: #474747; margin-bottom: 15px;">Hi ${fName},</p><p style="font-size: 16px; color: #474747; margin-bottom: 15px;">We hope you're having a good week.</p><p style="font-size: 16px; color: #474747; margin-bottom: 15px;">We’re reaching out to let you know that we were unable to process your latest payment of <strong>${amount}</strong> for <strong>${service}</strong>. This is likely due to a minor issue like an expired card or outdated payment details.</p><p style="font-size: 16px; color: #474747; margin-bottom: 25px;">To ensure your service continues without disruption, please take a moment to update your payment method here: <a href="#" style="color: #0b996f; font-weight: bold;">Update Payment Method</a></p><p style="font-size: 16px; color: #474747; margin-bottom: 25px;">If you have already taken care of this, please disregard this email. If you need any assistance, simply reply to this email, and we would be happy to help.</p><p style="font-size: 16px; color: #474747; margin-bottom: 0;">Best regards,<br/><strong>${cName}</strong></p></div></div>`
      };
      const emailRes = await fetch('/api/sendEmail', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ payload: emailPayload }) });
      const emailData = await emailRes.json();

      const smsPayload = { sender: "Aura", recipient: phone, content: `Hi ${fName}, your payment of ${amount} for ${service} failed. Please update your payment method to avoid disruption. Reply for help. - ${cName}`, type: "transactional" };
      const smsRes = await fetch('/api/sendSms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ payload: smsPayload }) });
      const smsData = await smsRes.json();

      setLastPayload(JSON.stringify({ request: payload, response: { simulate: data, email: { status: emailRes.status, data: emailData }, sms: { status: smsRes.status, data: smsData } } }, null, 2));
      setTelemetry(prev => ({ ...prev, sent: prev.sent + 2, delivered: prev.delivered + 2 }));
    } catch (error) {
      console.error(error);
      setLastPayload(JSON.stringify({ error: String(error) }, null, 2));
    }
  };

  const executeDefaultPaymentFailure = async () => {
    try {
      const email = 'brevolv@gmail.com';
      const phone = '+16179554170';
      const fName = 'Luis';
      const lName = 'Villeda';
      const cName = 'Brevo';
      const amount = '$149.00';
      const service = 'Soundcore Space One Pro';
      
      const payload = { email, phone, event: 'payment_failed', properties: { cart_value: '149.00', product_name: service, first_name: fName, last_name: lName, company_name: cName } };
      
      setEvents(prev => [`payment_failed: (${email})`, ...prev]);
      setLogs(prev => [...prev, '> [EVENT] payment_failed received.', '> [AURA AI] Escalating to Email & SMS.']);
      
      const res = await fetch('/api/simulatePaymentFailure', { method: 'POST' });
      const data = await res.json();
      data.actions.forEach((a: string) => setLogs(prev => [...prev, `> [AUTONOMOUS ACTION] ${a}`]));

      const emailPayload = {
        sender: { name: 'Aura Billing', email: 'brevolv@gmail.com' },
        to: [{ email: email, name: `${fName} ${lName}`.trim() }],
        subject: `Action required: Payment for ${service} failed`,
        htmlContent: `<div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 24px; border: 1px solid #d9d9d9;"><div style="text-align: center; margin-bottom: 20px;"><img src="https://framerusercontent.com/images/U0VltHCCefV5vWu8znLfThpPx0.png" alt="Payment Failed" style="width: 100%; max-width: 400px; border-radius: 8px;" /></div><div style="background: #ffffff; padding: 30px; border-radius: 16px; border: 1px solid #e3e3e3;"><p style="font-size: 16px; color: #474747; margin-bottom: 15px;">Hi ${fName},</p><p style="font-size: 16px; color: #474747; margin-bottom: 15px;">We hope you're having a good week.</p><p style="font-size: 16px; color: #474747; margin-bottom: 15px;">We’re reaching out to let you know that we were unable to process your latest payment of <strong>${amount}</strong> for <strong>${service}</strong>. This is likely due to a minor issue like an expired card or outdated payment details.</p><p style="font-size: 16px; color: #474747; margin-bottom: 25px;">To ensure your service continues without disruption, please take a moment to update your payment method here: <a href="#" style="color: #0b996f; font-weight: bold;">Update Payment Method</a></p><p style="font-size: 16px; color: #474747; margin-bottom: 25px;">If you have already taken care of this, please disregard this email. If you need any assistance, simply reply to this email, and we would be happy to help.</p><p style="font-size: 16px; color: #474747; margin-bottom: 0;">Best regards,<br/><strong>${cName}</strong></p></div></div>`
      };
      const emailRes = await fetch('/api/sendEmail', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ payload: emailPayload }) });
      const emailData = await emailRes.json();

      const smsPayload = { sender: "Aura", recipient: phone, content: `Hi ${fName}, your payment of ${amount} for ${service} failed. Please update your payment method to avoid disruption. Reply for help. - ${cName}`, type: "transactional" };
      const smsRes = await fetch('/api/sendSms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ payload: smsPayload }) });
      const smsData = await smsRes.json();

      setLastPayload(JSON.stringify({ request: payload, response: { simulate: data, email: { status: emailRes.status, data: emailData }, sms: { status: smsRes.status, data: smsData } } }, null, 2));
      setTelemetry(prev => ({ ...prev, sent: prev.sent + 2, delivered: prev.delivered + 2 }));
    } catch (error) {
      console.error(error);
      setLastPayload(JSON.stringify({ error: String(error) }, null, 2));
    }
  };

  const executeLiveSmsFallback = async () => {
    try {
      const email = recipientEmail || 'brevolv@gmail.com';
      const phone = recipientPhone ? (recipientPhone.startsWith('+') ? recipientPhone : `+1${recipientPhone.replace(/\D/g, '')}`) : '+16179554170';
      const fName = firstName || 'Luis';
      const lName = lastName || 'Villeda';
      const cName = companyName || 'Brevo';
      const payload = { email, phone, event: 'cart_updated', properties: { cart_status: 'abandoned', cart_value: '149.00', product_name: 'Soundcore Space One Pro', first_name: fName, last_name: lName, company_name: cName } };
      
      setEvents(prev => [`cart_updated: abandoned (${phone})`, ...prev]);
      setLogs(prev => [...prev, '> [AURA AI] Intercepted event: cart_updated', '> [EXPLAINABLE AI] Escalating to SMS.']);
      const trackRes = await fetch('/api/trackEvent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ payload }) });
      const trackData = await trackRes.json();
      
      const smsPayload = {
        sender: "Aura",
        recipient: phone,
        content: `Hi ${fName}, your Soundcore Space One Pro is waiting in your cart! Complete your purchase for $149.00.`,
        type: "transactional"
      };
      const smsRes = await fetch('/api/sendSms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ payload: smsPayload }) });
      const smsData = await smsRes.json();
      
      setLastPayload(JSON.stringify({ request: payload, response: { trackEvent: { status: trackRes.status, data: trackData }, sms: { status: smsRes.status, data: smsData } } }, null, 2));
      setTelemetry(prev => ({ ...prev, sent: prev.sent + 1, delivered: prev.delivered + 1 }));
    } catch (error) {
      console.error(error);
      setLastPayload(JSON.stringify({ error: String(error) }, null, 2));
    }
  };

  const executeDefaultSmsFallback = async () => {
    try {
      const email = 'brevolv@gmail.com';
      const phone = '+16179554170';
      const fName = 'Luis';
      const lName = 'Villeda';
      const cName = 'Brevo';
      const payload = { email, phone, event: 'cart_updated', properties: { cart_status: 'abandoned', cart_value: '149.00', product_name: 'Soundcore Space One Pro', first_name: fName, last_name: lName, company_name: cName } };
      
      setEvents(prev => [`cart_updated: abandoned (${phone})`, ...prev]);
      setLogs(prev => [...prev, '> [AURA AI] Intercepted event: cart_updated', '> [EXPLAINABLE AI] Escalating to SMS.']);
      const trackRes = await fetch('/api/trackEvent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ payload }) });
      const trackData = await trackRes.json();
      
      const smsPayload = {
        sender: "Aura",
        recipient: phone,
        content: `Hi ${fName}, your Soundcore Space One Pro is waiting in your cart! Complete your purchase for $149.00.`,
        type: "transactional"
      };
      const smsRes = await fetch('/api/sendSms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ payload: smsPayload }) });
      const smsData = await smsRes.json();
      
      setLastPayload(JSON.stringify({ request: payload, response: { trackEvent: { status: trackRes.status, data: trackData }, sms: { status: smsRes.status, data: smsData } } }, null, 2));
      setTelemetry(prev => ({ ...prev, sent: prev.sent + 1, delivered: prev.delivered + 1 }));
    } catch (error) {
      console.error(error);
      setLastPayload(JSON.stringify({ error: String(error) }, null, 2));
    }
  };

  const resetSystem = () => {
    setLogs([]);
    setEvents([]);
    setTelemetry({ sent: 0, delivered: 0, opened: 0 });
    setLastPayload('');
  };

  const generateStrategy = async () => {
    const res = await fetch('/api/generateStrategy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ command: strategyCommand }) });
    const data = await res.json();
    setStrategy(data.strategy);
  };

  const exportAsset = async (type: string) => {
    const res = await fetch('/api/generateAssets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, payload: lastPayload }) });
    const data = await res.json();
    alert(`Generated ${type}:\n\n${data.asset || "No content."}`);
  };

  const modules = [
    { id: 'Nexus', name: 'Observability Nexus', icon: <Layers size={24} />, onClick: () => setIsNexusOpen(true), color: 'text-blue-600', colSpan: 2 },
    { id: 'F', name: 'Aura Copilot', icon: <Bot size={24} />, onClick: () => setIsCopilotOpen(true), color: 'text-indigo-500' },
    { id: 'H', name: 'Strategy Planner', icon: <Target size={24} />, onClick: () => setIsStrategyPlannerOpen(true), color: 'text-red-500' },
    { id: 'I', name: 'Immutable Audit Logs', icon: <Terminal size={24} />, onClick: () => setIsAuditModalOpen(true), color: 'text-teal-500' },
    { id: 'J', name: 'Chat Backups', icon: <MessageSquare size={24} />, onClick: () => setIsChatBackupsOpen(true), color: 'text-pink-500' },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div id="dashboard-container" className="min-h-screen p-8 bg-[var(--brand-mint-green-100)] text-[var(--brand-charcoal-grey-900)] relative">
      <header id="dashboard-header" className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tighter text-[var(--brand-charcoal-grey-900)] mb-2">Aura<span className="text-[var(--brand-forest-green-600)]">Intelligence</span></h1>
        <p className="text-[var(--brand-charcoal-grey-500)] font-medium uppercase tracking-widest text-sm">Control Center / Sovereign Execution</p>
      </header>



      <div id="modules-grid" className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {modules.map((mod) => (
          <button
            key={mod.id}
            id={`module-btn-${mod.id.toLowerCase()}`}
            onClick={mod.onClick}
            className={`flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-[var(--brand-charcoal-grey-75)] hover:shadow-md hover:border-[var(--brand-forest-green-600)] transition-all group ${mod.colSpan ? `lg:col-span-${mod.colSpan} col-span-2` : ''}`}
          >
            <div className={`p-4 rounded-full bg-[var(--brand-charcoal-grey-25)] group-hover:bg-[var(--brand-mint-green-100)] mb-3 transition-colors ${mod.color}`}>
              {mod.icon}
            </div>
            {mod.id !== 'Nexus' && <h2 className="text-[10px] font-bold text-[var(--brand-charcoal-grey-500)] uppercase tracking-widest mb-1">Module {mod.id}</h2>}
            <h3 className="text-sm font-semibold text-[var(--brand-charcoal-grey-900)] text-center leading-tight">{mod.name}</h3>
          </button>
        ))}
      </div>

      {/* Modals */}
      <ObservabilityNexus 
        isOpen={isNexusOpen} 
        onClose={() => setIsNexusOpen(false)}
        webhookStatus={webhookStatus}
        events={events}
        logs={logs}
        lastPayload={lastPayload}
        customerState={customerState}
        telemetry={telemetry}
        executeLiveCartAbandonment={() => setIsCartAbandonmentSlideOpen(true)}
        simulatePaymentFailure={() => setIsPaymentFailureSlideOpen(true)}
        executeLiveSmsFallback={() => setIsSmsFallbackSlideOpen(true)}
        clearEvents={() => setEvents([])}
      />
      <BrevoCopilot context={logs.join('\n')} isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />
      <AuditLogModal isOpen={isAuditModalOpen} onClose={() => setIsAuditModalOpen(false)} />
      <ChatBackupsModal isOpen={isChatBackupsOpen} onClose={() => setIsChatBackupsOpen(false)} />

      <Modal id="modal-strategy-planner" isOpen={isStrategyPlannerOpen} onClose={() => setIsStrategyPlannerOpen(false)} title={<><Target size={20} /> Module H: Strategy Planner</>}>
        <div id="strategy-planner-container" className="bg-white p-6 rounded-xl shadow border border-[var(--brand-charcoal-grey-75)]">
          <div className="flex gap-2 mb-4">
            <input id="strategy-command-input" value={strategyCommand} onChange={e => setStrategyCommand(e.target.value)} className="flex-grow bg-[var(--brand-charcoal-grey-25)] border border-[var(--brand-charcoal-grey-75)] p-3 rounded-lg text-[var(--brand-charcoal-grey-900)]" placeholder="Enter campaign objective..." />
            <button id="strategy-generate-btn" onClick={generateStrategy} className="px-6 py-3 bg-[var(--brand-forest-green-600)] text-white font-bold rounded-lg hover:bg-[var(--brand-forest-green-500)] transition-colors">Generate</button>
          </div>
          {strategy && (
            <div id="strategy-output" className="mt-4 p-4 bg-gray-50 rounded-xl border text-sm text-[var(--brand-charcoal-grey-700)] max-h-64 overflow-y-auto">
              <ReactMarkdown>{strategy}</ReactMarkdown>
            </div>
          )}
        </div>
      </Modal>

      {/* Floating Pop-up Window for Cart Abandonment */}
      <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${isCartAbandonmentSlideOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        
        {/* Overlay */}
        <div 
          className={`absolute inset-0 bg-[var(--brand-charcoal-grey-900)]/40 backdrop-blur-sm transition-opacity duration-300 ${isCartAbandonmentSlideOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsCartAbandonmentSlideOpen(false)}
        ></div>

        {/* Modal Container with Liquid-Crystal Edges */}
        <div className={`relative w-full max-w-md bg-white/80 backdrop-blur-xl border border-[var(--brand-mint-green-100)] shadow-[0_8px_32px_rgba(11,153,111,0.2)] rounded-3xl overflow-hidden transform transition-all duration-300 ${isCartAbandonmentSlideOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
          
          {/* Decorative Gradient Header */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[var(--brand-mint-green-100)] via-[var(--brand-forest-green-500)] to-[var(--brand-forest-green-600)]"></div>

          <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 mt-2">
              <h2 className="text-xl font-bold text-[var(--brand-charcoal-grey-900)] flex items-center gap-2">
                <Target size={24} className="text-[var(--brand-forest-green-600)]" />
                Cart Abandonment
              </h2>
              <button onClick={() => setIsCartAbandonmentSlideOpen(false)} className="text-[var(--brand-charcoal-grey-500)] hover:text-[var(--brand-forest-green-600)] transition-colors bg-[var(--brand-charcoal-grey-25)] hover:bg-[var(--brand-mint-green-100)] p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div id="live-demo-target" className="bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-[var(--brand-mint-green-100)] flex-1 overflow-y-auto">
              <h3 className="text-sm font-bold text-[var(--brand-forest-green-600)] uppercase tracking-widest mb-4">Live Demo Target</h3>
              
              <div className="flex flex-col gap-4">
                <input id="input-first-name" type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-white/80 border border-[var(--brand-mint-green-100)] focus:border-[var(--brand-forest-green-500)] focus:ring-1 focus:ring-[var(--brand-forest-green-500)] outline-none p-3 rounded-xl text-sm text-[var(--brand-charcoal-grey-900)] transition-all" />
                <input id="input-last-name" type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-white/80 border border-[var(--brand-mint-green-100)] focus:border-[var(--brand-forest-green-500)] focus:ring-1 focus:ring-[var(--brand-forest-green-500)] outline-none p-3 rounded-xl text-sm text-[var(--brand-charcoal-grey-900)] transition-all" />
                <input id="input-company-name" type="text" placeholder="Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full bg-white/80 border border-[var(--brand-mint-green-100)] focus:border-[var(--brand-forest-green-500)] focus:ring-1 focus:ring-[var(--brand-forest-green-500)] outline-none p-3 rounded-xl text-sm text-[var(--brand-charcoal-grey-900)] transition-all" />
                <input id="input-email" type="email" placeholder="Email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} className="w-full bg-white/80 border border-[var(--brand-mint-green-100)] focus:border-[var(--brand-forest-green-500)] focus:ring-1 focus:ring-[var(--brand-forest-green-500)] outline-none p-3 rounded-xl text-sm text-[var(--brand-charcoal-grey-900)] transition-all" />
                <input id="input-phone" type="tel" placeholder="Phone" value={recipientPhone} onChange={e => setRecipientPhone(e.target.value)} className="w-full bg-white/80 border border-[var(--brand-mint-green-100)] focus:border-[var(--brand-forest-green-500)] focus:ring-1 focus:ring-[var(--brand-forest-green-500)] outline-none p-3 rounded-xl text-sm text-[var(--brand-charcoal-grey-900)] transition-all" />
                
                <div className="relative">
                  <input id="input-custom-image" type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="w-full bg-white/80 border border-[var(--brand-mint-green-100)] p-3 rounded-xl text-sm text-[var(--brand-forest-green-600)] font-medium flex items-center justify-center gap-2 hover:bg-[var(--brand-mint-green-100)] transition-colors">
                    <Activity size={16} /> {customImage ? 'Image Selected' : 'Upload Custom Image'}
                  </div>
                </div>
                
                <div className="mt-6 flex flex-col gap-3">
                  <button 
                    onClick={() => {
                      executeLiveCartAbandonment();
                      setIsCartAbandonmentSlideOpen(false);
                    }} 
                    className="w-full p-3 bg-[var(--brand-forest-green-600)] text-white font-bold rounded-xl hover:bg-[var(--brand-forest-green-500)] shadow-[0_4px_14px_rgba(11,153,111,0.3)] hover:shadow-[0_6px_20px_rgba(11,153,111,0.4)] transition-all transform hover:-translate-y-0.5"
                  >
                    Send Custom API Call
                  </button>
                  
                  <button 
                    onClick={() => {
                      executeDefaultCartAbandonment();
                      setIsCartAbandonmentSlideOpen(false);
                    }} 
                    className="w-full p-3 bg-white text-[var(--brand-forest-green-600)] border-2 border-[var(--brand-forest-green-600)] font-bold rounded-xl hover:bg-[var(--brand-mint-green-100)] transition-all"
                  >
                    Send Default Trigger (Luis)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Pop-up Window for SMS Fallback */}
      <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${isSmsFallbackSlideOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        
        {/* Overlay */}
        <div 
          className={`absolute inset-0 bg-[var(--brand-charcoal-grey-900)]/40 backdrop-blur-sm transition-opacity duration-300 ${isSmsFallbackSlideOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsSmsFallbackSlideOpen(false)}
        ></div>

        {/* Modal Container with Liquid-Crystal Edges */}
        <div className={`relative w-full max-w-md bg-white/80 backdrop-blur-xl border border-[var(--brand-mint-green-100)] shadow-[0_8px_32px_rgba(11,153,111,0.2)] rounded-3xl overflow-hidden transform transition-all duration-300 ${isSmsFallbackSlideOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
          
          {/* Decorative Gradient Header */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[var(--brand-mint-green-100)] via-[var(--brand-forest-green-500)] to-[var(--brand-forest-green-600)]"></div>

          <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 mt-2">
              <h2 className="text-xl font-bold text-[var(--brand-charcoal-grey-900)] flex items-center gap-2">
                <Target size={24} className="text-[var(--brand-forest-green-600)]" />
                SMS Fallback
              </h2>
              <button onClick={() => setIsSmsFallbackSlideOpen(false)} className="text-[var(--brand-charcoal-grey-500)] hover:text-[var(--brand-forest-green-600)] transition-colors bg-[var(--brand-charcoal-grey-25)] hover:bg-[var(--brand-mint-green-100)] p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div id="live-demo-target-sms" className="bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-[var(--brand-mint-green-100)] flex-1 overflow-y-auto">
              <h3 className="text-sm font-bold text-[var(--brand-forest-green-600)] uppercase tracking-widest mb-4">Live Demo Target</h3>
              
              <div className="flex flex-col gap-4">
                <input id="input-first-name-sms" type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-white/80 border border-[var(--brand-mint-green-100)] focus:border-[var(--brand-forest-green-500)] focus:ring-1 focus:ring-[var(--brand-forest-green-500)] outline-none p-3 rounded-xl text-sm text-[var(--brand-charcoal-grey-900)] transition-all" />
                <input id="input-last-name-sms" type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-white/80 border border-[var(--brand-mint-green-100)] focus:border-[var(--brand-forest-green-500)] focus:ring-1 focus:ring-[var(--brand-forest-green-500)] outline-none p-3 rounded-xl text-sm text-[var(--brand-charcoal-grey-900)] transition-all" />
                <input id="input-company-name-sms" type="text" placeholder="Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full bg-white/80 border border-[var(--brand-mint-green-100)] focus:border-[var(--brand-forest-green-500)] focus:ring-1 focus:ring-[var(--brand-forest-green-500)] outline-none p-3 rounded-xl text-sm text-[var(--brand-charcoal-grey-900)] transition-all" />
                <input id="input-phone-sms" type="tel" placeholder="Phone" value={recipientPhone} onChange={e => setRecipientPhone(e.target.value)} className="w-full bg-white/80 border border-[var(--brand-mint-green-100)] focus:border-[var(--brand-forest-green-500)] focus:ring-1 focus:ring-[var(--brand-forest-green-500)] outline-none p-3 rounded-xl text-sm text-[var(--brand-charcoal-grey-900)] transition-all" />
                
                <div className="mt-6 flex flex-col gap-3">
                  <button 
                    onClick={() => {
                      executeLiveSmsFallback();
                      setIsSmsFallbackSlideOpen(false);
                    }} 
                    className="w-full p-3 bg-[var(--brand-forest-green-600)] text-white font-bold rounded-xl hover:bg-[var(--brand-forest-green-500)] shadow-[0_4px_14px_rgba(11,153,111,0.3)] hover:shadow-[0_6px_20px_rgba(11,153,111,0.4)] transition-all transform hover:-translate-y-0.5"
                  >
                    Send Custom API Call
                  </button>
                  
                  <button 
                    onClick={() => {
                      executeDefaultSmsFallback();
                      setIsSmsFallbackSlideOpen(false);
                    }} 
                    className="w-full p-3 bg-white text-[var(--brand-forest-green-600)] border-2 border-[var(--brand-forest-green-600)] font-bold rounded-xl hover:bg-[var(--brand-mint-green-100)] transition-all"
                  >
                    Send Default Trigger (Luis)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Pop-up Window for Payment Failure */}
      <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${isPaymentFailureSlideOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        
        {/* Overlay */}
        <div 
          className={`absolute inset-0 bg-[var(--brand-charcoal-grey-900)]/40 backdrop-blur-sm transition-opacity duration-300 ${isPaymentFailureSlideOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsPaymentFailureSlideOpen(false)}
        ></div>

        {/* Modal Container with Liquid-Crystal Edges */}
        <div className={`relative w-full max-w-md bg-white/80 backdrop-blur-xl border border-[var(--brand-mint-green-100)] shadow-[0_8px_32px_rgba(11,153,111,0.2)] rounded-3xl overflow-hidden transform transition-all duration-300 ${isPaymentFailureSlideOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
          
          {/* Decorative Gradient Header */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[var(--brand-mint-green-100)] via-[var(--brand-forest-green-500)] to-[var(--brand-forest-green-600)]"></div>

          <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 mt-2">
              <h2 className="text-xl font-bold text-[var(--brand-charcoal-grey-900)] flex items-center gap-2">
                <Target size={24} className="text-[var(--brand-forest-green-600)]" />
                Simulate Payment Failure
              </h2>
              <button onClick={() => setIsPaymentFailureSlideOpen(false)} className="text-[var(--brand-charcoal-grey-500)] hover:text-[var(--brand-forest-green-600)] transition-colors bg-[var(--brand-charcoal-grey-25)] hover:bg-[var(--brand-mint-green-100)] p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div id="live-demo-target-payment" className="bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-[var(--brand-mint-green-100)] flex-1 overflow-y-auto">
              <h3 className="text-sm font-bold text-[var(--brand-forest-green-600)] uppercase tracking-widest mb-4">Live Demo Target</h3>
              
              <div className="flex flex-col gap-4">
                <input id="input-first-name-payment" type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-white/80 border border-[var(--brand-mint-green-100)] focus:border-[var(--brand-forest-green-500)] focus:ring-1 focus:ring-[var(--brand-forest-green-500)] outline-none p-3 rounded-xl text-sm text-[var(--brand-charcoal-grey-900)] transition-all" />
                <input id="input-last-name-payment" type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-white/80 border border-[var(--brand-mint-green-100)] focus:border-[var(--brand-forest-green-500)] focus:ring-1 focus:ring-[var(--brand-forest-green-500)] outline-none p-3 rounded-xl text-sm text-[var(--brand-charcoal-grey-900)] transition-all" />
                <input id="input-company-name-payment" type="text" placeholder="Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full bg-white/80 border border-[var(--brand-mint-green-100)] focus:border-[var(--brand-forest-green-500)] focus:ring-1 focus:ring-[var(--brand-forest-green-500)] outline-none p-3 rounded-xl text-sm text-[var(--brand-charcoal-grey-900)] transition-all" />
                <input id="input-email-payment" type="email" placeholder="Email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} className="w-full bg-white/80 border border-[var(--brand-mint-green-100)] focus:border-[var(--brand-forest-green-500)] focus:ring-1 focus:ring-[var(--brand-forest-green-500)] outline-none p-3 rounded-xl text-sm text-[var(--brand-charcoal-grey-900)] transition-all" />
                <input id="input-phone-payment" type="tel" placeholder="Phone" value={recipientPhone} onChange={e => setRecipientPhone(e.target.value)} className="w-full bg-white/80 border border-[var(--brand-mint-green-100)] focus:border-[var(--brand-forest-green-500)] focus:ring-1 focus:ring-[var(--brand-forest-green-500)] outline-none p-3 rounded-xl text-sm text-[var(--brand-charcoal-grey-900)] transition-all" />
                
                <div className="mt-6 flex flex-col gap-3">
                  <button 
                    onClick={() => {
                      executeLivePaymentFailure();
                      setIsPaymentFailureSlideOpen(false);
                    }} 
                    className="w-full p-3 bg-[var(--brand-forest-green-600)] text-white font-bold rounded-xl hover:bg-[var(--brand-forest-green-500)] shadow-[0_4px_14px_rgba(11,153,111,0.3)] hover:shadow-[0_6px_20px_rgba(11,153,111,0.4)] transition-all transform hover:-translate-y-0.5"
                  >
                    Send Custom API Call
                  </button>
                  
                  <button 
                    onClick={() => {
                      executeDefaultPaymentFailure();
                      setIsPaymentFailureSlideOpen(false);
                    }} 
                    className="w-full p-3 bg-white text-[var(--brand-forest-green-600)] border-2 border-[var(--brand-forest-green-600)] font-bold rounded-xl hover:bg-[var(--brand-mint-green-100)] transition-all"
                  >
                    Send Default Trigger (Luis)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;