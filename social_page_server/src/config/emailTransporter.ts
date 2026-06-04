import nodemailer,{TransportOptions} from 'nodemailer'
import {env} from './config.env'

export const emailTransporter = nodemailer.createTransport({
  host: env.smtp_host,
  port: Number(env.smtp_port),
  secure: Number(env.port) === 465,
  auth: {
    user: env.email,
    pass: env.emailPass,
  },
} as TransportOptions);