const EMAIL_PATTERN = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

export function normalizeCompanionEmail(value: string): string | null {
  const email = value.trim();
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) return null;
  const [local, domain] = email.split('@');
  if (local.length > 64 || local.startsWith('.') || local.endsWith('.') || local.includes('..')) return null;
  return `${local}@${domain.toLowerCase()}`;
}

export function buildTaskInvitationUrl(taskTitle: string, recipients: readonly string[] = []): string {
  const uniqueRecipients = new Map<string, string>();
  for (const recipient of recipients) {
    const email = normalizeCompanionEmail(recipient);
    if (!email) throw new Error('Correo de invitación inválido.');
    if (!uniqueRecipients.has(email.toLowerCase())) uniqueRecipients.set(email.toLowerCase(), email);
  }
  const addresses = [...uniqueRecipients.values()].map((email) => {
    const [local, domain] = email.split('@');
    return `${encodeURIComponent(local)}@${domain}`;
  }).join(',');
  const title = taskTitle.trim();
  const subject = title
    ? `Hagamos juntos: ${title.replace(/[\r\n]+/g, ' ')}`
    : 'Hagamos una tarea juntos · YA PUES';
  const body = [
    '¡Hola!',
    '',
    'Te invito a hacer esta tarea conmigo:',
    title || 'Una tarea en YA PUES',
    '',
    'Coordinemos los detalles por aquí.',
  ].join('\r\n');

  return `mailto:${addresses}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
