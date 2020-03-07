'use strict';
const axios = require('axios');

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

  //TODO: move to another file
  const getHeaders = (accessToken) => ({headers: {'Authorization': `Bearer ${accessToken}`}});
  const getUserData = async (accessToken) => {
    const { data } = await axios.get('https://api.github.com/user', {...getHeaders(accessToken)});    
    return data;
  };

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

    // TODO: store data in a table
    const userData = await getUserData(parsedData.access_token);
    
    console.log('authentication.handler.login', 'process completed');
    return {
      ...parsedData,
      ...userData
    };
  });

  return api.run(event, context);
}
