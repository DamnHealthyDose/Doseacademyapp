// Transactional email via Resend. Needs the secrets RESEND_API_KEY, CONSENT_EMAIL_FROM and APP_URL.

export interface EmailConfig {
  resendKey: string
  from: string
  appUrl: string
}

export const getEmailConfig = (): EmailConfig | null => {
  const resendKey = Deno.env.get('RESEND_API_KEY')
  const from = Deno.env.get('CONSENT_EMAIL_FROM')
  const appUrl = Deno.env.get('APP_URL')?.replace(/\/$/, '')
  if (!resendKey || !from || !appUrl) return null
  return { resendKey, from, appUrl }
}

export const sendEmail = async (
  config: EmailConfig,
  message: { to: string; subject: string; html: string },
): Promise<boolean> => {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: config.from, ...message }),
    })
    if (!res.ok) console.error('email send failed', res.status)
    return res.ok
  } catch (_err) {
    console.error('email send failed (network)')
    return false
  }
}

export const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
