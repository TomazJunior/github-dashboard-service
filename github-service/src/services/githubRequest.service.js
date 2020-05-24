const DynamoDBService = require('./dynamodb.service');
const GithubRequest = require('../model/dynamodb.model').GithubRequest;

class GithubRequestService {

  constructor(logger) {
      this.logger = logger;
  }

  async add(githubRequest) {
    this.logger.debug('GithubRequestService.add', 'process started');
    return new Promise((resolve, reject) => {
        return githubRequest.save((err, data) => {
            if (err) {
                this.logger.debug('GithubRequestService.add', 'process failed');
                return reject(err);
            };
            resolve(data.get());
            this.logger.debug('GithubRequestService.add', 'process completed');
        });
    });
  }

  async get(userId, key) {
    this.logger.debug('GithubRequestService.get', 'process started');
    return new Promise((resolve, reject) => {
      return GithubRequest.get(userId, key, (err, data) => {
        if (err) {
            this.logger.debug('GithubRequestService.get', 'process failed');
            return reject(err);
        };
        resolve(data && data.get());
        this.logger.debug('GithubRequestService.get', 'process completed');
      });
    });
  }

  async update(userId, key, properties) {
    this.logger.debug('GithubRequestService.update', 'process started');
    return new Promise((resolve, reject) => {
        return GithubRequest.update({...properties, userId, key}, (err, data) => {
            if (err) {
                this.logger.debug('GithubRequestService.update', 'process failed');
                return reject(err);
            };
            resolve(data);
            this.logger.debug('GithubRequestService.update', 'process completed');
        });
    });
  }

}

module.exports = GithubRequestService;
