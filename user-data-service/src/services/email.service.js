
const nodemailer = require("nodemailer");

class EmailService {
  constructor(logger) {
    const {adminEmail, supportEmail, emailPwd} = process.env;

    this.adminEmail = adminEmail;
    this.supportEmail = supportEmail;
    this.logger = logger;
    this.mailerConfig = {
      host: "smtpout.europe.secureserver.net",  
      secureConnection: true,
      port: 587,
      auth: {
          user: adminEmail,
          pass: emailPwd
      }
    };
    this.transporter = nodemailer.createTransport(this.mailerConfig);
  }

  async sendEmail(contact) {
    this.logger.debug('EmailService.sendEmail', 'process started');
    return new Promise((resolve, reject) => {
      const mailOptions = {
        from: this.mailerConfig.auth.user,
        to: this.supportEmail,
        subject: contact.subject,
        text: `
          Contact Info
          ============
          id: ${contact.id}
          email: ${contact.email}
          name: ${contact.name}
          userId: ${contact.userId}
          authenticated: ${contact.authenticated}
          resolved: ${contact.resolved}

          Message
          =======
          ${contact.message}
        `
      };
      this.transporter.sendMail(mailOptions, (error) => {
        if (error) {
          this.logger.error('EmailService.sendEmail', `process failed - ${error}`);
          reject(error);
        } else {
          this.logger.debug('EmailService.sendEmail', 'process completed');
          resolve({status: 'ok'})
        }
      });
    });
  }
}

module.exports = EmailService;