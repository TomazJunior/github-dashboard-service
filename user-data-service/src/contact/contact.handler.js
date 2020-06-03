const Response = require('../shared/response');
const { Contact } = require('../shared/model/dynamodb.model');
const EmailService = require('../services/email.service');
const UserService = require('../user/user.service');
const ContactService = require('./contact.service');
const { DEFAULT_CONTACT_EMAIL } = require('../shared/constants');

class ContactHandler {
  
  constructor(logger) {
    this.contactService = new ContactService(logger);
    this.userService = new UserService(logger);
    this.emailService = new EmailService(logger);
  }

  async sendEmail(req, res) {
    req.log.debug('ContactHandler.sendEmail', 'Process started');
    let userId;
    if (req.body.email && req.body.email !== DEFAULT_CONTACT_EMAIL) {
      const user = await this.userService.getOneByEmail(req.body.email);
      if (user) {
        userId = user.id;
      }
    }
    const contact = new Contact({
      ...req.body,
      userId
    });
    const contactDB = await this.contactService.add(contact);
    
    const data = await this.emailService.sendEmail(contactDB);
    res.json(new Response(data));
    req.log.debug('ContactHandler.sendEmail', 'Process completed');
  }

}

module.exports = ContactHandler;