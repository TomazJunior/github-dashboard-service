const Response = require('../shared/response');
const DashboardService = require('./dashboard.service');
const CardService = require('../card/card.service');
const Dashboard = require('../shared/model/dynamodb.model').Dashboard;

class DashboardHandler {
  
  constructor(logger) {
    this.service = new DashboardService(logger);
    this.cardService = new CardService(logger);
  }

  async get(req, res) {
    req.log.debug('DashboardHandler.get', 'Process started');
    const { userId } = req.params;
    const dashboards = await this.service.get(userId);
    res.json(new Response(dashboards));
    req.log.debug('DashboardHandler.get', 'Process completed');
  }

  async getOne(req, res) {
    req.log.debug('DashboardHandler.getOne', 'Process started');
    const { userId, id } = req.params;
    const dashboard = await this.service.getOne(userId, id);
    let cards = [];
    if (dashboard) {
      cards = await this.cardService.get(userId, id);
    }
    res.json(new Response({...dashboard, cards: cards.length}));
    req.log.debug('DashboardHandler.getOne', 'Process completed');
  }

  async add(req, res) {
    req.log.debug('DashboardHandler.add', 'Process started');
    const { userId } = req.params;
    const dashboard = new Dashboard({
      ...req.body,
      userId
    });
    const dashboardDB = await this.service.add(dashboard);
    res.json(new Response(dashboardDB));
    req.log.debug('DashboardHandler.add', 'Process completed');
  }

  async update(req, res) {
    req.log.debug('DashboardHandler.update', 'Process started');
    const { userId, id } = req.params;
    const dashboardDB = await this.service.update(userId, id, { ... req.body });
    res.json(new Response(dashboardDB));
    req.log.debug('DashboardHandler.update', 'Process completed');
  }

  async remove(req, res) {
    req.log.debug('DashboardHandler.remove', 'Process started');
    const { userId, id } = req.params;
    const dashboardDB = await this.service.remove(userId, id);
    res.json(new Response(dashboardDB));
    req.log.debug('DashboardHandler.remove', 'Process completed');
  }

}

module.exports = DashboardHandler;