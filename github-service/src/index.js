'use strict';
const axios = require('axios');
const { decrypt } = require('./encrypt.service');

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
    const { data } = await axios.get('https://api.github.com/user/repos', getHeader(authorization));
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
    // /github/user needs to have the original authorization
    const { data } = await axios.get('https://api.github.com/user', { headers: { authorization } });
    const { id, name, email, type, location, avatar_url } = data;
    console.log('github.service.handler.user', 'process completed');
    return { id, name, email, type, location, avatarUrl: avatar_url };
  });

  api.get('/github/repos/:owner/:repo/labels', async (req, res) => {
    console.log('github.service.handler.repos.labels', 'process started');
    const { headers: { authorization } } = req;
    const { owner, repo, entity} = req.params;
    const { data } = await axios.get(`https://api.github.com/repos/${owner}/${repo}/labels`, getHeader(authorization));
    const response = data
    .map(item => {
      const { id, name, color, description } = item;
      return { id, name, color, description };
    });
    console.log('github.service.handler.repos.labels', 'process completed');
    return response;
  });

  api.get('/github/repos/:owner/:repo/milestones', async (req, res) => {
    console.log('github.service.handler.repos.milestones', 'process started');
    const { headers: { authorization } } = req;
    const { owner, repo, entity} = req.params;
    const { data } = await axios.get(`https://api.github.com/repos/${owner}/${repo}/milestones`, getHeader(authorization));
    const response = data
    .map(item => {
      const { id, html_url, title, description, open_issues, closed_issues, state, created_at, updated_at, due_on, closed_at } = item;
      return { id, html_url, title, description, open_issues, closed_issues, state, created_at, updated_at, due_on, closed_at };
    });
    console.log('github.service.handler.repos.milestones', 'process completed');
    return response;
  });

  api.get('/github/repos/:owner/:repo/:entity', async (req, res) => {
    console.log('github.service.handler.repos.entity', 'process started');
    const { headers: { authorization } } = req;
    const { owner, repo, entity} = req.params;
    const { state, labels, milestone } = req.query;
    console.log('milestone=>', milestone);
    const { data } = await axios.get(`https://api.github.com/repos/${owner}/${repo}/issues?state=${state || 'all'}${labels ? `&labels=${labels}`: ''}`, getHeader(authorization));
    const response = data
    .filter(item => {
      let isValid = true;
      if (entity === 'issues') {
        isValid = !item.pull_request;
      }
      if (entity === 'pulls') {
        isValid = !!item.pull_request;
      }

      if (isValid && milestone) {
        isValid = item.milestone && milestone === item.milestone.title;
      }

      return isValid;
    })
    .map(item => {
      const { id, title, state, url, html_url, locked, number, created_at, closed_at, merged_at, user: { login, avatar_url } } = item;
      return { id, title, state, url, html_url, locked, number, created_at, closed_at, merged_at, user: { login, avatar_url } };
    });
    console.log('github.service.handler.repos.entity', 'process completed');
    return response;
  });

  const getHeader = (authorization) => {
    console.log('github.service.getHeader', 'process started');
    const header = { 
      headers: { 
        authorization: `Bearer ${decrypt(authorization.replace('Bearer', '').trim())}`
      }
    };
    console.log('github.service.getHeader', 'process completed');
    return header;
  }

  return api.run(event, context);
}
