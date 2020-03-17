'use strict';
const axios = require('axios');
const { login, logout } = require('./userDataService');
const { getAuthenticatedUser } = require('./githubService');

exports.handler = async (event, context) => {
  const api = require('lambda-api')();

  api.use(async (req, res, next) => {
    res.cors();
    next();
  });

  api.use((error, req, res, next) => {
    req.log.error(error);
    res.cors();
    res.status(error.statusCode || 500).send({error: error.message});
    next();
  });

  api.post('/auth/login', async (req, res) => {
    console.log('authentication.handler.login', 'process started');
    const { githubClientId, githubClientSecretId } = process.env;
    const { body } = req;
    const { data } = await axios.post(`https://github.com/login/oauth/access_token?client_id=${githubClientId}&code=${body.code}&client_secret=${githubClientSecretId}`);    
    const searchParams = new URLSearchParams(data);
    console.log('authentication.handler.login', 'searchParams', searchParams);
    const parsedData = Array.from(searchParams).reduce((previous, [key, value]) => {
      previous[key] = value;
      return previous;
    }, {});
    if (parsedData.error) {
      throw new Error(parsedData.error);
    }

    const authenticatedUser = await getAuthenticatedUser(parsedData.access_token);
    const userData = await login(parsedData.access_token, authenticatedUser);
    
    console.log('authentication.handler.login', 'process completed');
    return {
      ...parsedData,
      ...authenticatedUser,
      ...userData
    };
  });

  api.post('/auth/logout', async (req, res) => {
    console.log('authentication.handler.logout', 'process started');
    const { data } = await logout(req.headers);
    console.log('authentication.handler.logout', 'process completed');
    return data;
  });

  return api.run(event, context);
}
