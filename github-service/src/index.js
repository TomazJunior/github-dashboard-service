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

  api.get('/github/user/repos', async (req, res) => {
    console.log('github.service.handler.user.repos', 'process started');
    const { headers: { authorization } } = req;
    const { data } = await axios.get('https://api.github.com/user/repos', { headers: { authorization } });
    return data.map(repo => {
      const { id, name, full_name, html_url } = repo;
      return { id, name, full_name, html_url };
    });
  });

  return api.run(event, context);
}
