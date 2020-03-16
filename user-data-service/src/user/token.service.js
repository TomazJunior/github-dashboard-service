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
      this.logger.debug('TokenService.get', 'process started');
      return new Promise((resolve, reject) => {
        return Token.get(token, email, (err, data) => {
          if (err) {
            this.logger.debug('TokenService.get', 'process failed');
            return reject(err);
          };
          resolve(data && data.get());
          this.logger.debug('TokenService.get', 'process completed');
        });
      });
    }

    async update(token, email, properties) {
      this.logger.debug('TokenService.update', 'process started');
      return new Promise((resolve, reject) => {
          return User.update({...properties, token, email}, (err, data) => {
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
            return User.destroy(token, email, {ReturnValues: 'ALL_OLD'}, (err, data) => {
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