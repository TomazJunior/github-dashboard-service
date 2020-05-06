const { Card } = require('../shared/model/dynamodb.model');

class CardService {

  constructor(logger) {
    this.logger = logger;
  }

  async get(userId, dashboardId) {
    this.logger.debug('CardService.get', 'process started ' + dashboardId);
    return new Promise((resolve, reject) => {
      return Card.query(dashboardId)
          .exec((err, data) => {
            if (err) {
              this.logger.debug('CardService.get', 'process failed');
              return reject(err);
            };
            resolve(data.Items
              .map((i) => i.get())
              .filter((i) => i.userId === userId));
            this.logger.debug('CardService.get', 'process completed');
          });
    });
  }

  async getOne(dashboardId, id) {
    this.logger.debug('CardService.getOne', 'process started');
    return new Promise((resolve, reject) => {
      return Card.get(dashboardId, id, (err, data) => {
        if (err) {
          this.logger.debug('CardService.getOne', 'process failed');
          return reject(err);
        };
        resolve(data && data.get());
        this.logger.debug('CardService.getOne', 'process completed');
      });
    });
  }

  async add(card) {
    this.logger.debug('CardService.add', 'process started');
    return new Promise((resolve, reject) => {
      return card.save((err) => {
        if (err) {
          this.logger.debug('CardService.add', 'process failed');
          return reject(err);
        };
        resolve(card);
        this.logger.debug('CardService.add', 'process completed');
      });
    });
  }

  async update(userId, dashboardId, id, properties) {
    this.logger.debug('CardService.update', 'process started');
    return new Promise((resolve, reject) => {
      return Card.update({...properties, userId, dashboardId, id}, (err, data) => {
        if (err) {
          this.logger.debug('CardService.update', 'process failed');
          return reject(err);
        };
        resolve(data);
        this.logger.debug('CardService.update', 'process completed');
      });
    });
  }

  async remove(userId, dashboardId, id) {
    this.logger.debug('CardService.remove', `process started`);
    return new Promise(async (resolve, reject) => {
      return Card.destroy(dashboardId, id, {ReturnValues: 'ALL_OLD'}, (err, data) => {
        if (err) {
          this.logger.debug('CardService.remove', 'process failed');
          return reject(err);
        };
        resolve({
          deleted: !!data
        });
        this.logger.debug('CardService.remove', 'process completed');
      });
    });
  }
};

module.exports = CardService;