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
    const { userId, dashboardId } = req.params;
    const cards = await this.service.get(userId, dashboardId);
    res.json(new Response(cards));
    req.log.debug('CardHandler.get', 'Process completed');
  }

  async add(req, res) {
    req.log.debug('CardHandler.add', 'Process started');
    const { userId, dashboardId } = req.params;
    const card = new Card({
      ...req.body,
      userId, 
      dashboardId
    });
    const dashboardDB = await this.dashboardService.getOne(userId, dashboardId);
    if (!dashboardDB) { throw new Error(`Dashboard ${dashboardId} does not exist`); }
    if (dashboardDB.userId !== userId) { throw new Error(`Dashboard ${dashboardId} does not belong to ${userId}`); }

    const cardDB = await this.service.add(card);
    res.json(new Response(cardDB));
    req.log.debug('CardHandler.add', 'Process completed');
  }

  async updateInBatch(req, res) {
    req.log.debug('CardHandler.updateInBatch', 'Process started');
    const { userId, dashboardId, id } = req.params;
    const { cards } = req.body;
    const cardsDB = await this.service.get(userId, dashboardId);
    if (cardsDB.length !== cards.length) {
      throw new Error(`There are cards that do not belong to ${userId}`);
    }
    for (const card of cards) {
      await this.service.update(userId, dashboardId, card.id, { ...card });
    }
    res.json(new Response({
      cards: cards.map((card)=>card.id)
    }));
    req.log.debug('CardHandler.updateInBatch', 'Process completed');
  }

  async update(req, res) {
    req.log.debug('CardHandler.update', 'Process started');
    const { userId, dashboardId, id } = req.params;
    const cardDB = await this.service.getOne(dashboardId, id);
    if (!cardDB || cardDB.userId !== userId) { throw new Error(`Card ${id} does not belong to ${userId}`); }

    const updatedCardDB = await this.service.update(userId, dashboardId, id, { ... req.body });
    res.json(new Response(updatedCardDB));
    req.log.debug('CardHandler.update', 'Process completed');
  }

  async remove(req, res) {
    req.log.debug('CardHandler.remove', 'Process started');
    const { userId, dashboardId, id } = req.params;
    const cardDB = await this.service.getOne(dashboardId, id);
    if (!cardDB || cardDB.userId !== userId) { throw new Error(`Card ${id} does not belong to ${userId}`); }

    const oldCardDB = await this.service.remove(userId, dashboardId, id);
    res.json(new Response(oldCardDB));
    req.log.debug('CardHandler.remove', 'Process completed');
  }
}

module.exports = CardHandler;