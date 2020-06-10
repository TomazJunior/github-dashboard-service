const UserSource = require('../shared/model/dynamodb.model').UserSource;

class UserSourceService {

    constructor(logger) {
        this.logger = logger;
    }

    async add(userSource) {
        this.logger.debug('UserSourceService.add', 'process started');
        return new Promise((resolve, reject) => {
            return userSource.save((err) => {
                if (err) {
                    this.logger.debug('UserSourceService.add', 'process failed');
                    return reject(err);
                };
                resolve(userSource);
                this.logger.debug('UserSourceService.add', 'process completed');
            });
        });
    }

    async update(id, sourceId, properties) {
      this.logger.debug('UserSourceService.update', 'process started');
      return new Promise((resolve, reject) => {
          return UserSource.update({...properties, id, sourceId}, (err, data) => {
              if (err) {
                  this.logger.debug('UserSourceService.update', 'process failed');
                  return reject(err);
              };
              resolve(data && data.get());
              this.logger.debug('UserSourceService.update', 'process completed');
          });
      });
  }

    async getOne(id, sourceId) {
      this.logger.debug('UserSourceService.getOne', `process started id -> ${id}, sourceId -> ${sourceId}`);
      return new Promise((resolve, reject) => {
        return UserSource.get(id, sourceId, (err, data) => {
          if (err) {
            this.logger.debug('UserSourceService.getOne', 'process failed');
            this.logger.error('UserSourceService.getOne', err);
            return reject(err);
          };
          resolve(data && data.get());
          this.logger.debug('UserSourceService.getOne', 'process completed');
        });
      });
    }

    async getByUserId(userId) {
      this.logger.debug('UserSourceService.getByUserId', 'process started');
      return new Promise((resolve, reject) => {
        UserSource
          .query(userId)
          .usingIndex('UserIdIndex')
          .loadAll()
          .exec((err, data) => {
              if (err) {
                  this.logger.debug('UserSourceService.getByUserId', 'process failed');
                  return reject(err);
              };
              resolve(data && data.Items && data.Items.length && data.Items.map((item) => {
                return item.get();
              }));
              this.logger.debug('UserSourceService.getByUserId', 'process completed');
          });
      });        
    }
};

module.exports = UserSourceService;