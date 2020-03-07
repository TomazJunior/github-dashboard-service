const Response = require('../shared/response');
const CardService = require('./card.service');
const DashboardService = require('../dashboard/dashboard.service');
const { Card } = require('../shared/model/dynamodb.model');

class CardHandler {
  
  constructor(logger) {
    this.service = new CardService(logger);
    this.dashboardService = new DashboardService(logger);
  }

  async get(req, res) {
    req.log.debug('CardHandler.get', 'Process started');
    const { email, dashboardId } = req.params;
    const cards = await this.service.get(email, dashboardId);
    res.json(new Response(cards));
    req.log.debug('CardHandler.get', 'Process completed');
  }

  async add(req, res) {
    req.log.debug('CardHandler.add', 'Process started');
    const { email, dashboardId } = req.params;
    const card = new Card({
      ...req.body,
      email, 
      dashboardId
    });
    const dashboardDB = await this.dashboardService.getOne(email, dashboardId);
    if (!dashboardDB) { throw new Error(`Dashboard ${dashboardId} does not exist`); }
    if (dashboardDB.email !== email) { throw new Error(`Dashboard ${dashboardId} does not belong to ${email}`); }

    const cardDB = await this.service.add(card);
    res.json(new Response(cardDB));
    req.log.debug('CardHandler.add', 'Process completed');
  }

  async update(req, res) {
    req.log.debug('CardHandler.update', 'Process started');
    const { email, dashboardId, id } = req.params;
    const cardDB = await this.service.getOne(dashboardId, id);
    if (!cardDB || cardDB.email !== email) { throw new Error(`Card ${id} does not belong to ${email}`); }

    const updatedCardDB = await this.service.update(email, dashboardId, id, { ... req.body });
    res.json(new Response(updatedCardDB));
    req.log.debug('CardHandler.update', 'Process completed');
  }

  async remove(req, res) {
    req.log.debug('CardHandler.remove', 'Process started');
    const { email, dashboardId, id } = req.params;
    const cardDB = await this.service.getOne(dashboardId, id);
    if (!cardDB || cardDB.email !== email) { throw new Error(`Card ${id} does not belong to ${email}`); }

    const oldCardDB = await this.service.remove(email, dashboardId, id);
    res.json(new Response(oldCardDB));
    req.log.debug('CardHandler.remove', 'Process completed');
  }
}

module.exports = CardHandler;