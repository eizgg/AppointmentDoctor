/**
 * Helpers para enviar emails de pedido de turno vía Gmail API.
 */

/**
 * Detecta si una receta corresponde a estudios de imágenes
 * (resonancia / tomografía) que deben rutearse al mail de diagnóstico.
 * @param {{ estudios?: string[] | null, especialidad?: string | null }} receta
 * @returns {'imagenes' | 'general'}
 */
export function detectarTipoEstudio(receta) {
  const keywords = /resonancia|tomograf[ií]a|\bRMN\b|\bTAC\b|resonancia\s*magn[eé]tica|tomograf[ií]a\s*computada/i
  const partes = []
  if (Array.isArray(receta?.estudios)) partes.push(...receta.estudios)
  if (receta?.especialidad) partes.push(receta.especialidad)
  const texto = partes.join(' ')
  return keywords.test(texto) ? 'imagenes' : 'general'
}

/**
 * Codifica un string a base64url (formato requerido por Gmail API).
 */
function toBase64Url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/**
 * Arma un mensaje MIME RFC 2822 y lo codifica en base64url.
 * Si se pasa un adjunto, genera un multipart/mixed con el PDF.
 * @param {object} opts
 * @param {string} opts.from - Email del remitente
 * @param {string} opts.to - Email del destinatario
 * @param {string} opts.subject - Asunto
 * @param {string} opts.body - Cuerpo en texto plano
 * @param {{ filename: string, content: Buffer, mimeType?: string }} [opts.attachment]
 * @returns {string} Mensaje codificado en base64url
 */
export function buildRawMessage({ from, to, subject, body, attachment }) {
  // El asunto puede tener acentos → codificar como UTF-8 base64 (RFC 2047)
  const encodedSubject = `=?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`

  if (!attachment) {
    const message = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${encodedSubject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset="UTF-8"',
      'Content-Transfer-Encoding: 7bit',
      '',
      body,
    ].join('\r\n')
    return toBase64Url(message)
  }

  const boundary = `boundary_${Date.now().toString(16)}`
  const attachmentBase64 = attachment.content.toString('base64').replace(/(.{76})/g, '$1\r\n')

  const message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${encodedSubject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    body,
    '',
    `--${boundary}`,
    `Content-Type: ${attachment.mimeType || 'application/pdf'}; name="${attachment.filename}"`,
    'Content-Transfer-Encoding: base64',
    `Content-Disposition: attachment; filename="${attachment.filename}"`,
    '',
    attachmentBase64,
    '',
    `--${boundary}--`,
  ].join('\r\n')

  return toBase64Url(message)
}

/**
 * Envía un mensaje ya codificado en base64url mediante Gmail API.
 * @param {object} gmail - Cliente Gmail autenticado (getGmailClient)
 * @param {string} raw - Mensaje en base64url
 * @returns {Promise<string>} El ID del mensaje enviado
 */
export async function sendGmailMessage(gmail, raw) {
  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  })
  return res.data.id
}
