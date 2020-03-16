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
                resolve(user);
                this.logger.debug('UserService.add', 'process completed');
            });
        });
    }

    async getOne(email) {
        this.logger.debug('UserService.getOne', 'process started');
        return new Promise((resolve, reject) => {
        return User.get(email, (err, data) => {
            if (err) {
            this.logger.debug('UserService.getOne', 'process failed');
            return reject(err);
            };
            resolve(data && data.get());
            this.logger.debug('UserService.getOne', 'process completed');
        });
        });
    }

    async update(email, properties) {
        this.logger.debug('UserService.update', 'process started');
        return new Promise((resolve, reject) => {
            return User.update({...properties, email}, (err, data) => {
                if (err) {
                    this.logger.debug('UserService.update', 'process failed');
                    return reject(err);
                };
                resolve(data);
                this.logger.debug('UserService.update', 'process completed');
            });
        });
    }

    async remove(email) {
        this.logger.debug('UserService.remove', `process started`);
        return new Promise((resolve, reject) => {
            return User.destroy(email, {ReturnValues: 'ALL_OLD'}, (err, data) => {
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