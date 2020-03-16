const Response = require('../shared/response');
const UserService = require('./user.service');
const DashboardService = require('../dashboard/dashboard.service');
const { Dashboard, User } = require('../shared/model/dynamodb.model');

class UserHandler {
  
  constructor(logger) {
    this.service = new UserService(logger);
    this.dashboardService = new DashboardService(logger);
  }

  async get(req, res) {
    req.log.debug('UserHandler.get', 'Process started');
    const { email } = req.params;
    const user = await this.service.getOne(email);
    res.json(new Response(user));
    req.log.debug('UserHandler.get', 'Process completed');
  }

  async upsert(req, res) {
    req.log.debug('UserHandler.upsert', 'Process started');
    const { email } = req.body;
    const { authorization } = req.headers;
    const userDB = await this.service.getOne(email);
    
    let response;
    if (userDB) {
      req.log.debug('UserHandler.upsert', 'update user');
      const updatedUserDB = await this.service.update(email, { ... req.body, currentToken: authorization.replace('Bearer', '').trim() });
      response = new Response(updatedUserDB);
    } else {
      req.log.debug('UserHandler.upsert', 'create user');
      const user = new User({
        ...req.body,
        email
      });
      const userDB = await this.service.add(user);
      response = new Response(userDB);
    }

    const dashboards = await this.dashboardService.get(email);
    req.log.debug('UserHandler.upsert #dashboards:', dashboards.length);
    if (!dashboards.length) {
      await this.dashboardService.add(new Dashboard({email}));
    }

    res.json(response);
    req.log.debug('UserHandler.upsert', 'Process completed');
  }
}

module.exports = UserHandler;