const ContactHandler = require('./contact.handler');

const initialize = (router) => {

    router.post('contact/email', (req, res) => {
        const contactHandler = new ContactHandler(req.log);
        return contactHandler.sendEmail(req, res);
    });

};

module.exports = initialize;