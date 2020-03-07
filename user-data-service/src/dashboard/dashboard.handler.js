const Response = require('../shared/response');
const DashboardService = require('./dashboard.service');
const Dashboard = require('../shared/model/dynamodb.model').Dashboard;

class DashboardHandler {
  
  constructor(logger) {
    this.service = new DashboardService(logger);
  }

  async get(req, res) {
    req.log.debug('DashboardHandler.get', 'Process started');
    const { email } = req.params;
    const dashboards = await this.service.get(email);
    res.json(new Response(dashboards));
    req.log.debug('DashboardHandler.get', 'Process completed');
  }

  async add(req, res) {
    req.log.debug('DashboardHandler.add', 'Process started');
    const { email } = req.params;
    const dashboard = new Dashboard({
      ...req.body,
      email
    });
    const dashboardDB = await this.service.add(dashboard);
    res.json(new Response(dashboardDB));
    req.log.debug('DashboardHandler.add', 'Process completed');
  }

  async update(req, res) {
    req.log.debug('DashboardHandler.update', 'Process started');
    const { email, id } = req.params;
    const dashboardDB = await this.service.update(email, id, { ... req.body });
    res.json(new Response(dashboardDB));
    req.log.debug('DashboardHandler.update', 'Process completed');
  }

  async remove(req, res) {
    req.log.debug('DashboardHandler.remove', 'Process started');
    const { email, id } = req.params;
    const dashboardDB = await this.service.remove(email, id);
    res.json(new Response(dashboardDB));
    req.log.debug('DashboardHandler.remove', 'Process completed');
  }

}

module.exports = DashboardHandler;