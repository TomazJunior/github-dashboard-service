const DynamoDBService = require('../services/dynamodb.service');
const Dashboard = require('../shared/model/dynamodb.model').Dashboard;

class DashboardService {

    constructor(logger) {
        this.logger = logger;
    }

    async add(dashboard) {
        this.logger.debug('DashboardService.add', 'process started');
        return new Promise((resolve, reject) => {
            return dashboard.save((err, data) => {
                if (err) {
                    this.logger.debug('DashboardService.add', 'process failed');
                    return reject(err);
                };
                resolve(data.get());
                this.logger.debug('DashboardService.add', 'process completed');
            });
        });
    }

    async get(email) {
        this.logger.debug('DashboardService.get', 'process started');
        return new Promise((resolve, reject) => {
            return Dashboard.query(email)
                .exec((err, data) => {
                    if (err) {
                        this.logger.debug('DashboardService.get', 'process failed');
                        return reject(err);
                    };
                    resolve(data.Items.map((i) => i.get()));
                    this.logger.debug('DashboardService.get', 'process completed');
                });
        });
    }

    async getOne(email, id) {
        this.logger.debug('DashboardService.get', 'process started');
        return new Promise((resolve, reject) => {
            return Dashboard.get(email, id, (err, data) => {
                if (err) {
                    this.logger.debug('DashboardService.get', 'process failed');
                    return reject(err);
                };
                resolve(data && data.get());
                this.logger.debug('DashboardService.get', 'process completed');
            });
        });
    }

    async update(email, id, properties) {
        this.logger.debug('DashboardService.update', 'process started');
        return new Promise((resolve, reject) => {
            return Dashboard.update({...properties, id, email}, (err, data) => {
                if (err) {
                    this.logger.debug('DashboardService.update', 'process failed');
                    return reject(err);
                };
                resolve(data);
                this.logger.debug('DashboardService.update', 'process completed');
            });
        });
    }

    async remove(email, id) {
        this.logger.debug('DashboardService.remove', `process started`);
        return new Promise((resolve, reject) => {
            return Dashboard.destroy(email, id, {ReturnValues: 'ALL_OLD'}, (err, data) => {
                if (err) {
                    this.logger.debug('DashboardService.remove', 'process failed');
                    return reject(err);
                };
                resolve({
                    deleted: !!data
                });
                this.logger.debug('DashboardService.remove', 'process completed');
            });
        });
    }
};

module.exports = DashboardService;