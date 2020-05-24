'use strict';
const axios = require('axios');
const DynamoDBService = require('./services/dynamodb.service');
const GithubRequestService = require('./services/githubRequest.service');
const { GithubRequest } = require('./model/dynamodb.model');
const { decrypt } = require('./encrypt.service');

//TODO: update to multiple files (router, handler, service)
exports.handler = async (event, context) => {
  const api = require('lambda-api')();
  
  api.use(async (req, res, next) => {
    res.cors();
    if (event.requestContext.stage === 'local') {
      try {
        req.log.debug('Create tables locally');
        const dynamoDBService = new DynamoDBService(req.log);
        await dynamoDBService.createTables();  
      } catch (error) {
        req.log.error(error);
      }
    }
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

  const githubRequester = async (req, url, prepareData)  => {
    console.log('github.service.githubRequester', 'process started');
    const { headers: { authorization } } = req;
    const userId = req.headers['user-id'];
    const githubRequestService = new GithubRequestService(req.log);

    const githubRequest = await githubRequestService.get(userId, url);
    const result = await axios.get(
      url, 
      {
        ...getHeader(authorization, githubRequest && githubRequest.etag),
        validateStatus: (status) => {
          return status < 400
        }
      }
    );
    if (githubRequest && result.status === 304) {
      console.log('github.service.githubRequester', 'process completed Not Modified');
      return githubRequest.value;
    }

    const response = prepareData(result.data);
    const { etag } = result.headers;
    if (etag) {
      if (githubRequest) {
        await githubRequestService.update(userId, url, {
          etag,
          value: response
        });
      } else {
        await githubRequestService.add(new GithubRequest({
          userId,
          key: url,
          etag,
          value: response
        }));
      }
    }
    console.log('github.service.githubRequester', 'process completed');
    return response;
  }

  api.get('/github/user/repos', async (req, res) => {
    console.log('github.service.handler.user.repos', 'process started');
    const url = 'https://api.github.com/user/repos';
    const response = await githubRequester(req, url, (data) => {
      return data.map(repo => {
        const { id, name, full_name, html_url, owner: { login } } = repo;
        return { id, name, full_name, html_url, owner: { login } };
      });
    });
    console.log('github.service.handler.user.repos', 'process completed');
    return response || [];
  });

  api.get('/github/user', async (req, res) => {
    console.log('github.service.handler.user', 'process started');
    const { headers: { authorization } } = req;
    // /github/user needs to have the original authorization
    const url = 'https://api.github.com/user';
    const response = await githubRequester(req, url, (data) => {
      const { id, name, email, type, location, avatar_url } = data;
      return { id, name, email, type, location, avatarUrl: avatar_url };
    });
    console.log('github.service.handler.user', 'process completed');
    return response;
  });

  api.get('/github/repos/:owner/:repo/labels', async (req, res) => {
    console.log('github.service.handler.repos.labels', 'process started');
    const { owner, repo, entity} = req.params;
    const url = `https://api.github.com/repos/${owner}/${repo}/labels`;
    const response = await githubRequester(req, url, (data) => {
      return data.map(item => {
        const { id, name, color, description } = item;
        return { id, name, color, description };
      });
    });
    console.log('github.service.handler.repos.labels', 'process completed');
    return response || [];
  });

  api.get('/github/repos/:owner/:repo/milestones', async (req, res) => {
    console.log('github.service.handler.repos.milestones', 'process started');
    const { owner, repo, entity} = req.params;
    const url = `https://api.github.com/repos/${owner}/${repo}/milestones`;
    const response = await githubRequester(req, url, (data) => {
      return data.map(item => {
        const { id, html_url, title, description, open_issues, closed_issues, state, created_at, updated_at, due_on, closed_at } = item;
        return { id, html_url, title, description, open_issues, closed_issues, state, created_at, updated_at, due_on, closed_at };
      });
    });
    console.log('github.service.handler.repos.milestones', 'process completed');
    return response || [];
  });

  api.get('/github/repos/:owner/:repo/assignees', async (req, res) => {
    console.log('github.service.handler.repos.assignees', 'process started');
    const { owner, repo, entity} = req.params;
    const url = `https://api.github.com/repos/${owner}/${repo}/assignees`;
    const response = await githubRequester(req, url, (data) => {
      return data.map(item => {
        const { id, avatar_url, url, login } = item;
        return { id, avatar_url, url, login };
      });
    }) || [];
    const assignees = [];
    for (const item of response) {
      const assignee = { ...item };
      if (assignee.url) {
        assignee.name = await githubRequester(req, assignee.url, (data) => {
          return data.name;
        });
      }
      assignees.push(assignee);
    }
    console.log('github.service.handler.repos.assignees', 'process completed');
    return assignees;
  });

  api.get('/github/repos/:owner/:repo/:entity', async (req, res) => {
    console.log('github.service.handler.repos.entity', 'process started');
    const { headers: { authorization } } = req;
    const { owner, repo, entity} = req.params;
    const { state, labels, milestone, assignees } = req.query;
    const url = `https://api.github.com/repos/${owner}/${repo}/issues?state=${state || 'all'}${labels ? `&labels=${labels}`: ''}`;
    const response = await githubRequester(req, url, (data) => {
      return data.filter(item => {
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
  
        if (isValid && assignees) {
          if (!item.assignees || !item.assignees.length) {
            isValid = false;
          } else {
            isValid = item.assignees.some((assignee) => {
              return assignees
                .split(',')
                .find(login => login === assignee.login);
            })
          }
        }
        return isValid;
      })
      .map(item => {
        const { id, title, state, url, html_url, locked, number, created_at, closed_at, merged_at, user: { login, avatar_url } } = item;
        return { id, title, state, url, html_url, locked, number, created_at, closed_at, merged_at, user: { login, avatar_url } };
      });
    });
    console.log('github.service.handler.repos.entity', 'process completed');
    return response || [];
  });

  const getHeader = (authorization, eTag) => {
    console.log('github.service.getHeader', 'process started');
    const header = { 
      headers: { 
        authorization: `Bearer ${decrypt(authorization.replace('Bearer', '').trim())}`
      }
    };
    if (eTag) {
      header.headers['If-None-Match'] = eTag;
    }
    console.log('github.service.getHeader', 'process completed');
    return header;
  }

  return api.run(event, context);
}
