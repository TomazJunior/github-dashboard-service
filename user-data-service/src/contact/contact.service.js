const DynamoDBService = require('../services/dynamodb.service');
const Contact = require('../shared/model/dynamodb.model').Contact;

class ContactService {

    constructor(logger) {
        this.logger = logger;
    }

    async add(contact) {
        this.logger.debug('ContactService.add', 'process started');
        return new Promise((resolve, reject) => {
            return contact.save((err, data) => {
                if (err) {
                    this.logger.debug('ContactService.add', 'process failed');
                    return reject(err);
                };
                resolve(data.get());
                this.logger.debug('ContactService.add', 'process completed');
            });
        });
    }
};

module.exports = ContactService;