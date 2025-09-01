import { CreateEmailResponse } from 'resend'

import { resend, sendEmail } from './send-email.util'

describe('send-email.util.ts', () => {
  it('should send an email', () => {
    const payload = {
      to: 'test@gmail.com',
      subject: 'test',
      html: '<p>testing</p>'
    }

    const sendSpy = jest.spyOn(resend.emails, 'send')
    sendSpy.mockResolvedValue({ data: { id: 'abc' } } as CreateEmailResponse)

    sendEmail(payload)

    expect(sendSpy).toHaveBeenCalledWith({
      from: 'pallascodes@bernardo-torres.com',
      ...payload
    })
  })
})
