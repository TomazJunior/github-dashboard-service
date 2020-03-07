const Response = require('../shared/response');
const DashboardService = require('./dashboard.service');
const Dashboard = require('../shared/model/dynamodb.model').Dashboard;

class DashboardHandler {
  
  constructor(logger) {
    this.service = new DashboardService(logger);
  }

  async getAll(req, res) {
    req.log.debug('DashboardHandler.getAll', 'Process started');
    const { email } = req.params;
    const dashboards = await this.service.getAll(email);
    res.json(new Response(dashboards));
    req.log.debug('DashboardHandler.getAll', 'Process completed');
  }
}

module.exports = DashboardHandler;