const DynamoDBService = require('../services/dynamodb.service');

class DashboardService {

    constructor(logger) {
        this.logger = logger;
    }

    async getAll(email) {
        this.logger.debug('DashboardService', 'process started');
        const dynamoDBService = new DynamoDBService(this.logger);
        const dashboards = await dynamoDBService.scan(process.env.dashboardsTableName);
        this.logger.debug('DashboardService', 'process completed');
        return dashboards;
    }
};

module.exports = DashboardService;