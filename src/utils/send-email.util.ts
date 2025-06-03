import { config } from 'dotenv'
config()

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export function sendEmail({
  to,
  subject,
  html
}: {
  to: string
  subject: string
  html: string
}) {
  return resend.emails.send({
    from: 'pallascodes@bernardo-torres.com',
    to,
    subject,
    html
  })
}
