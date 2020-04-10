'use strict';
const axios = require('axios');

//TODO: update to multiple files (router, handler, service)
exports.handler = async (event, context) => {
  const api = require('lambda-api')();

  api.use(async (req, res, next) => {
    res.cors();
    next();
  });

  api.use((error, req, res, next) => {
    req.log.error(error);
    res.cors();
    res.status(error.statusCode || 
      (error.response && error.response.status) || 
      500).send({error: error.message});
    next();
  });

  api.get('/github/user/repos', async (req, res) => {
    console.log('github.service.handler.user.repos', 'process started');
    const { headers: { authorization } } = req;
    const { data } = await axios.get('https://api.github.com/user/repos', { headers: { authorization } });
    const response = data.map(repo => {
      const { id, name, full_name, html_url, owner: { login } } = repo;
      return { id, name, full_name, html_url, owner: { login } };
    });
    console.log('github.service.handler.user.repos', 'process completed');
    return response;
  });

  api.get('/github/user', async (req, res) => {
    console.log('github.service.handler.user', 'process started');
    const { headers: { authorization } } = req;
    const { data } = await axios.get('https://api.github.com/user', { headers: { authorization } });
    const { id, name, email, type, location, avatar_url } = data;
    console.log('github.service.handler.user', 'process completed');
    return { id, name, email, type, location, avatarUrl: avatar_url };
  });

  api.get('/github/repos/:owner/:repo/pulls', async (req, res) => {
    console.log('github.service.handler.repos.pulls', 'process started');
    const { headers: { authorization } } = req;
    const { owner, repo} = req.params;
    const { state } = req.query;
    const { data } = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls?state=${state || 'all'}`, { headers: { authorization } });
    const response = data.map(pr => {
      const { id, title, state, url, html_url, locked, number, created_at, closed_at, merged_at, user: { login, avatar_url } } = pr;
      return { id, title, state, url, html_url, locked, number, created_at, closed_at, merged_at, user: { login, avatar_url } };
    });
    console.log('github.service.handler.repos.pulls', 'process completed');
    return response;
  });

  return api.run(event, context);
}
