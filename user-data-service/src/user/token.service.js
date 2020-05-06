const Token = require('../shared/model/dynamodb.model').Token;
const crypto = require('crypto');

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

    async getOneByExternalToken(externalToken) {
        this.logger.debug('TokenService.getOneByExternalToken', 'process started');
        return new Promise((resolve, reject) => {
            Token
            .query(externalToken)
            .usingIndex('ExternalTokenIndex')
            .loadAll()
            .exec((err, data) => {
                if (err) {
                    this.logger.debug('TokenService.getOneByExternalToken', 'process failed');
                    return reject(err);
                };
                resolve(data && data.Items && data.Items.length && data.Items[0].get());
                this.logger.debug('TokenService.getOneByExternalToken', 'process completed');
            });
        });        
    }

    async getOne(token, userId) {
      this.logger.debug('TokenService.getOne', 'process started');
      return new Promise((resolve, reject) => {
        return Token.get(token, userId, (err, data) => {
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

    async update(token, userId, properties) {
      this.logger.debug('TokenService.update', 'process started');
      return new Promise((resolve, reject) => {
          return Token.update({...properties, token, userId}, (err, data) => {
              if (err) {
                  this.logger.debug('TokenService.update', 'process failed');
                  return reject(err);
              };
              resolve(data);
              this.logger.debug('TokenService.update', 'process completed');
          });
      });
    }

    async remove(token, userId) {
        this.logger.debug('TokenService.remove', `process started`);
        return new Promise((resolve, reject) => {
            return Token.destroy(token, userId, {ReturnValues: 'ALL_OLD'}, (err, data) => {
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