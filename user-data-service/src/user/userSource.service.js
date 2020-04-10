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
};

module.exports = UserSourceService;