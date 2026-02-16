import { google } from 'googleapis'

/**
 * Creates an authenticated Gmail client using a refresh token.
 */
export async function getGmailClient(refreshToken) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )
  oauth2Client.setCredentials({ refresh_token: refreshToken })
  return google.gmail({ version: 'v1', auth: oauth2Client })
}

/**
 * Searches for OSDE emails containing medical order notifications.
 * @param {object} gmail - Authenticated Gmail client
 * @param {string} [afterDate] - Optional date filter in YYYY/MM/DD format
 * @returns {Promise<Array<{id: string, threadId: string}>>}
 */
export async function searchOsdeEmails(gmail, afterDate) {
  let q = 'from:noreply@osde.com.ar "órdenes de prácticas y estudios"'
  if (afterDate) q += ` after:${afterDate}`

  const res = await gmail.users.messages.list({ userId: 'me', q, maxResults: 20 })
  return res.data.messages || []
}

/**
 * Gets the full content of an email message.
 * @param {object} gmail - Authenticated Gmail client
 * @param {string} messageId - Gmail message ID
 * @returns {Promise<string>} The HTML body of the email
 */
export async function getEmailContent(gmail, messageId) {
  const res = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full',
  })

  const parts = res.data.payload?.parts || []
  // Try to find HTML part first, then plain text
  let htmlBody = ''

  function findHtmlPart(parts) {
    for (const part of parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        return Buffer.from(part.body.data, 'base64url').toString('utf-8')
      }
      if (part.parts) {
        const found = findHtmlPart(part.parts)
        if (found) return found
      }
    }
    return null
  }

  htmlBody = findHtmlPart(parts)

  // If no parts, check the body directly
  if (!htmlBody && res.data.payload?.body?.data) {
    htmlBody = Buffer.from(res.data.payload.body.data, 'base64url').toString('utf-8')
  }

  return htmlBody || ''
}

/**
 * Extracts OSDE prescription links from email HTML content.
 * OSDE emails use SendGrid tracking URLs that wrap the actual links.
 * We find <a> tags whose text contains "Prescripción del día" and extract the href.
 * Also checks for direct consultoriodigital2.osde.com.ar links as fallback.
 * @param {string} htmlBody - The HTML content of the email
 * @returns {string[]} Array of unique PDF URLs
 */
export function extractPdfLinks(htmlBody) {
  const links = []

  // Strategy 1: Find <a> tags with "Prescripción del día" text (SendGrid tracking URLs)
  const anchorRegex = /<a\s[^>]*href="([^"]+)"[^>]*>[^<]*Prescripci[oó]n del d[ií]a[^<]*<\/a>/gi
  let match
  while ((match = anchorRegex.exec(htmlBody)) !== null) {
    const href = match[1].replace(/&amp;/g, '&')
    links.push(href)
  }

  // Strategy 2: Direct OSDE document links (fallback)
  const directRegex = /https?:\/\/consultoriodigital2\.osde\.com\.ar\/documento\?hash=[a-zA-Z0-9_\-]+/g
  const directMatches = htmlBody.match(directRegex) || []
  links.push(...directMatches)

  return [...new Set(links)]
}

/**
 * Downloads a PDF from a public OSDE URL.
 * The hash in the URL acts as an access token — no auth required.
 * @param {string} url - The OSDE document URL
 * @returns {Promise<Buffer>} The PDF file as a Buffer
 */
export async function downloadPdfFromUrl(url) {
  console.log(`[Gmail Download] Fetching URL: ${url.substring(0, 100)}...`)
  const res = await fetch(url)
  console.log(`[Gmail Download] Response status: ${res.status}, final URL: ${res.url?.substring(0, 100)}...`)
  if (!res.ok) throw new Error(`Error descargando PDF: ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  console.log(`[Gmail Download] Downloaded ${buffer.length} bytes, content-type: ${res.headers.get('content-type')}`)
  return buffer
}
