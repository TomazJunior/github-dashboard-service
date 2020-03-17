const Token = require('../shared/model/dynamodb.model').Token;

class TokenService {

    constructor(logger) {
        this.logger = logger;
    }

    async add(token) {
        this.logger.debug('TokenService.add', 'process started');
        return new Promise((resolve, reject) => {
            return token.save((err) => {
                if (err) {
                    this.logger.debug('TokenService.add', 'process failed');
                    return reject(err);
                };
                resolve(token);
                this.logger.debug('TokenService.add', 'process completed');
            });
        });
    }


    async getOne(token, email) {
      this.logger.debug('TokenService.getOne', 'process started');
      return new Promise((resolve, reject) => {
        return Token.get(token, email, (err, data) => {
          if (err) {
            this.logger.debug('TokenService.getOne', 'process failed');
            return reject(err);
          };
          resolve(data && data.get());
          this.logger.debug('TokenService.getOne', 'process completed');
        });
      });
    }

    async get(token) {
        this.logger.debug('TokenService.get', 'process started -> ' + token);
        return new Promise((resolve, reject) => {
            return Token
                .query(token)
                .limit(1)
                .exec((err, data) => {
                    if (err) {
                        this.logger.debug('TokenService.get', 'process failed');
                        return reject(err);
                    };
                    resolve(data && data.Items.length && data.Items[0].get());
                    this.logger.debug('TokenService.get', 'process completed');
                });
        });
    }

    async update(token, email, properties) {
      this.logger.debug('TokenService.update', 'process started');
      return new Promise((resolve, reject) => {
          return Token.update({...properties, token, email}, (err, data) => {
              if (err) {
                  this.logger.debug('TokenService.update', 'process failed');
                  return reject(err);
              };
              resolve(data);
              this.logger.debug('TokenService.update', 'process completed');
          });
      });
    }

    async remove(token, email) {
        this.logger.debug('TokenService.remove', `process started`);
        return new Promise((resolve, reject) => {
            return Token.destroy(token, email, {ReturnValues: 'ALL_OLD'}, (err, data) => {
                if (err) {
                    this.logger.debug('TokenService.remove', 'process failed');
                    return reject(err);
                };
                resolve({
                    deleted: !!data
                });
                this.logger.debug('TokenService.remove', 'process completed');
            });
        });
    }
};

module.exports = TokenService;