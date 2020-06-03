const Response = require('../shared/response');
const EmailService = require('../services/email.service');
const UserService = require('./user.service');
const UserSourceService = require('./userSource.service');
const ContactService = require('../contact/contact.service');
const TokenService = require('./token.service');
const DashboardService = require('../dashboard/dashboard.service');
const { Dashboard, User, Token, UserSource, Contact } = require('../shared/model/dynamodb.model');
const { GITHUB_SOURCE_ID } = require('../shared/sources');
const { encrypt } = require('../services/encrypt.service')

class UserHandler {
  
  constructor(logger) {
    this.service = new UserService(logger);
    this.userSourceService = new UserSourceService(logger);
    this.dashboardService = new DashboardService(logger);
    this.tokenService = new TokenService(logger);
    this.contactService = new ContactService(logger);
    this.emailService = new EmailService(logger);
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

  async sendEmail(req, res) {
    req.log.debug('UserHandler.sendEmail', 'Process started');
    const { userId } = req.params;
    const { authorization } = req.headers;
    const token = authorization.replace('Bearer', '').trim();
    const user = await this.tokenService.getOne(token, userId);
    if (!user) {
      throw new Error('Invalid token');
    }
    const contact = new Contact({
      ...req.body,
      email: user.email,
      userId,
      authenticated: true
    });
    const contactDB = await this.contactService.add(contact);
    const data = await this.emailService.sendEmail(contactDB);
    res.json(new Response(data));
    req.log.debug('UserHandler.sendEmail', 'Process completed');
  }

  async login(req, res) {
    req.log.debug('UserHandler.login', 'Process started');
    const id = req.body.id.toString();
    const { authorization } = req.headers;
    const externalToken = authorization.replace('Bearer', '').trim();
    
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
    let internalToken = '';
    const tokenDB = await this.tokenService.getOneByExternalToken(externalToken, userId);
    if (!tokenDB) {
      internalToken = encrypt(externalToken);
      await this.tokenService.add(new Token({
        userId,
        externalToken,
        token: internalToken
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
    res.json(new Response({
      ...user,
      token: internalToken
    }));
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