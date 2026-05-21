import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  async sendEmail(to: string, subject: string, content: string): Promise<void> {
    const mailOptions = {
      from: `"No Reply" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      text: content,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
