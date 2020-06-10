'use strict';
const axios = require('axios');
const { login, logout } = require('./userDataService');
const { getAuthenticatedUser } = require('./githubService');
const AuthError = require('./authError');

exports.handler = async (event, context) => {
  const api = require('lambda-api')();

  api.use(async (req, res, next) => {
    res.cors();
    next();
  });

  api.use((error, req, res, next) => {
    req.log.error(error);
    res.cors();
    res.status(
      error.statusCode || 
      (error.response && error.response.status) 
      || 500)
    .send({error: error.message});
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
    const userData = await login(parsedData.access_token, parsedData, authenticatedUser);
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

  api.post('/auth/refresh', async (req, res) => {
    console.log('authentication.handler.refresh', 'process started');
    const { githubClientId, githubClientSecretId } = process.env;
    const { refreshToken } = req.body;
    const { data } = await axios.post(`https://github.com/login/oauth/access_token?client_id=${githubClientId}&grant_type=refresh_token&client_secret=${githubClientSecretId}&refresh_token=${refreshToken}`);
    const searchParams = new URLSearchParams(data);
    const parsedData = Array.from(searchParams).reduce((previous, [key, value]) => {
      previous[key] = value;
      return previous;
    }, {});
    if (parsedData.error) {
      console.log('authentication.handler.refresh', `process failed ${parsedData.error_description}`);
      throw new AuthError(parsedData.error_description);
    }
    console.log('authentication.handler.refresh', 'process completed');
    return parsedData;
  });

  return api.run(event, context);
}
