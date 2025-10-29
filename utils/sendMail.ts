require('dotenv').config()
import nodemailer, { Transporter } from 'nodemailer'
import ejs from 'ejs'
import path from 'path'

interface EmailOptions {
    email: string
    subject: string
    template: string        // e.g., 'activationMail.ejs' or 'question-reply.ejs'
    data: { [key: string]: any }
}

const sendMail = async (options: EmailOptions): Promise<void> => {
    const transporter: Transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '465'),
        service: process.env.SMTP_SERVICE,
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD
        },
        tls: {
            rejectUnauthorized: false, // <-- allow self-signed
        },
    })

    const { email, subject, template, data } = options

    // GET THE PATH OF THE TEMPLATE DYNAMICALLY
    const templatePath = path.join(__dirname, '../mails', template)

    // RENDER THE EMAIL TEMPLATE WITH EJS
    const html: string = await ejs.renderFile(templatePath, data)

    const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: email,
        subject,
        html
    }

    // SEND EMAIL
    await transporter.sendMail(mailOptions)
}

export default sendMail
