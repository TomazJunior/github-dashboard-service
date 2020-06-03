const User = require('../shared/model/dynamodb.model').User;

class UserService {

    constructor(logger) {
        this.logger = logger;
    }

    async add(user) {
        this.logger.debug('UserService.add', 'process started');
        return new Promise((resolve, reject) => {
            return user.save((err) => {
                if (err) {
                    this.logger.debug('UserService.add', 'process failed');
                    return reject(err);
                };
                resolve(user.get());
                this.logger.debug('UserService.add', 'process completed');
            });
        });
    }

    async getOne(id) {
        this.logger.debug('UserService.getOne', 'process started');
        return new Promise((resolve, reject) => {
            return User.get(id, (err, data) => {
                if (err) {
                this.logger.debug('UserService.getOne', 'process failed');
                return reject(err);
                };
                resolve(data && data.get());
                this.logger.debug('UserService.getOne', 'process completed');
            });
        });
    }

    async getOneByEmail(email) {
        this.logger.debug('UserService.getOneByEmail', 'process started');
        return new Promise((resolve, reject) => {
            User
            .query(email)
            .usingIndex('EmailIndex')
            .loadAll()
            .exec((err, data) => {
                if (err) {
                    this.logger.debug('UserService.getOneByEmail', 'process failed');
                    return reject(err);
                };
                resolve(data && data.Items && data.Items.length && data.Items[0].get());
                this.logger.debug('UserService.getOneByEmail', 'process completed');
            });
        });        
    }

    async update(id, properties) {
        this.logger.debug('UserService.update', 'process started');
        return new Promise((resolve, reject) => {
            return User.update({...properties, id}, (err, data) => {
                if (err) {
                    this.logger.debug('UserService.update', 'process failed');
                    return reject(err);
                };
                resolve(data && data.get());
                this.logger.debug('UserService.update', 'process completed');
            });
        });
    }

    async remove(id) {
        this.logger.debug('UserService.remove', `process started`);
        return new Promise((resolve, reject) => {
            return User.destroy(id, {ReturnValues: 'ALL_OLD'}, (err, data) => {
                if (err) {
                    this.logger.debug('UserService.remove', 'process failed');
                    return reject(err);
                };
                resolve({
                    deleted: !!data
                });
                this.logger.debug('UserService.remove', 'process completed');
            });
        });
    }
};

module.exports = UserService;