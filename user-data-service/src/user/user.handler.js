const Response = require('../shared/response');
const UserService = require('./user.service');
const UserSourceService = require('./userSource.service');
const TokenService = require('./token.service');
const DashboardService = require('../dashboard/dashboard.service');
const { Dashboard, User, Token, UserSource } = require('../shared/model/dynamodb.model');
const { GITHUB_SOURCE_ID } = require('../shared/sources');

class UserHandler {
  
  constructor(logger) {
    this.service = new UserService(logger);
    this.userSourceService = new UserSourceService(logger);
    this.dashboardService = new DashboardService(logger);
    this.tokenService = new TokenService(logger);
  }

  async get(req, res) {
    req.log.debug('UserHandler.get', 'Process started');
    const { userId } = req.params;
    const user = await this.service.getOne(userId);
    res.json(new Response(user));
    req.log.debug('UserHandler.get', 'Process completed');
  }

  async updateDashboard(req, res) {
    req.log.debug('UserHandler.updateDashboard', 'Process started');
    const { userId, dashboardId } = req.params;
    const user = await this.service.update(userId, {
      dashboardId 
    });
    res.json(new Response({
      dashboardId: user.dashboardId
    }));
    req.log.debug('UserHandler.updateDashboard', 'Process completed');
  }

  async login(req, res) {
    req.log.debug('UserHandler.login', 'Process started');
    const id = req.body.id.toString();
    const { authorization } = req.headers;
    const accessToken = authorization.replace('Bearer', '').trim();
    
    const userSourceDB = await this.userSourceService.getOne(id, GITHUB_SOURCE_ID);
   
    let userDB;
    if (userSourceDB) {
      req.log.debug('UserHandler.login', 'update user');
      userDB = await this.service.getOne(userSourceDB.userId);
      await this.service.update(userDB.id, { ... req.body });
    } else {
      req.log.debug('UserHandler.login', 'create user');
      userDB = await this.service.add(new User({
        ...req.body,
        id: undefined
      }));
      req.log.debug('UserHandler.login', 'create user source');
      await this.userSourceService.add(new UserSource({ id, userId: userDB.id }))
    }
    
    const userId = userDB.id;
    const token = await this.tokenService.getOne(accessToken, userId);
    if (!token) {
      await this.tokenService.add(new Token({
        userId,
        token: accessToken
      }));
    }

    const dashboards = await this.dashboardService.get(userId);
    req.log.debug('UserHandler.login #dashboards:', dashboards.length);
    if (!dashboards.length) {
      const dashboardDB = await this.dashboardService.add(new Dashboard({userId}));
      await this.service.update(userId, {
        dashboardId: dashboardDB.id
      });
    }

    const user = await this.service.getOne(userId);
    res.json(new Response(user));
    req.log.debug('UserHandler.login', 'Process completed');
  }

  async logout(req, res) {
    req.log.debug('UserHandler.logout', 'Process started');
    const { authorization } = req.headers;
    const accessToken = authorization.replace('Bearer', '').trim();
    const tokenDB = await this.tokenService.get(accessToken);
    if (tokenDB) {
      if (tokenDB.destroyedAt) {
        req.log.debug('UserHandler.logout', `Token ${accessToken} is already destroyed`);
        req.log.debug('UserHandler.logout', 'Process completed');
        return new Response();
      }
      await this.tokenService.update(accessToken, tokenDB.userId, {destroyedAt: new Date()});
      res.json(new Response());
      req.log.debug('UserHandler.logout', 'Process completed');
    } else {
      req.log.debug('UserHandler.logout', 'Process failed');
      throw new Error(`Invalid token`);
    }
  }
}

module.exports = UserHandler;