const Response = require('../shared/response');
const UserService = require('./user.service');
const TokenService = require('./token.service');
const DashboardService = require('../dashboard/dashboard.service');
const { Dashboard, User, Token } = require('../shared/model/dynamodb.model');

class UserHandler {
  
  constructor(logger) {
    this.service = new UserService(logger);
    this.dashboardService = new DashboardService(logger);
    this.tokenService = new TokenService(logger);
  }

  async get(req, res) {
    req.log.debug('UserHandler.get', 'Process started');
    const { email } = req.params;
    const user = await this.service.getOne(email);
    res.json(new Response(user));
    req.log.debug('UserHandler.get', 'Process completed');
  }

  async login(req, res) {
    req.log.debug('UserHandler.login', 'Process started');
    const { email } = req.body;
    const { authorization } = req.headers;
    const accessToken = authorization.replace('Bearer', '').trim();
    const userDB = await this.service.getOne(email);
    
    let response;
    if (userDB) {
      req.log.debug('UserHandler.login', 'update user');
      const updatedUserDB = await this.service.update(email, { ... req.body });
      response = new Response(updatedUserDB);
    } else {
      req.log.debug('UserHandler.login', 'create user');
      const user = new User({
        ...req.body,
        email
      });
      const userDB = await this.service.add(user);
      response = new Response(userDB);
    }

    const token = await this.tokenService.getOne(accessToken, email);
    if (!token) {
      await this.tokenService.add(new Token({
        email, 
        token: accessToken
      }));
    }

    const dashboards = await this.dashboardService.get(email);
    req.log.debug('UserHandler.login #dashboards:', dashboards.length);
    if (!dashboards.length) {
      await this.dashboardService.add(new Dashboard({email}));
    }

    res.json(response);
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
      await this.tokenService.update(accessToken, tokenDB.email, {destroyedAt: new Date()});
      res.json(new Response());
      req.log.debug('UserHandler.logout', 'Process completed');
    } else {
      req.log.debug('UserHandler.logout', 'Process failed');
      throw new Error(`Invalid token`);
    }
  }
}

module.exports = UserHandler;