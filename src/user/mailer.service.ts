import { Injectable } from '@nestjs/common'
import * as nodemailer from 'nodemailer'

@Injectable()
export class MailerService {
  private transporter = nodemailer.createTransport({
    host: 'maildev',
    port: 1025,
    secure: false,
  })

  async sendMail(to: string, subject: string, html: string) {
    await this.transporter.sendMail({
      from: 'no-reply@sondages-express.local',
      to,
      subject,
      html,
    })
  }
} 