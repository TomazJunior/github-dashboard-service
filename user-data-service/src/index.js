'use strict';
const axios = require('axios');
const DynamoDBService = require('./services/dynamodb.service');

const initializeDashboard = require('./dashboard/dashboard.router');
const initializeCard = require('./card/card.router');

exports.handler = async (event, context) => {
  const router = require('lambda-api')({
    logger: {
      level: process.env.LoggerLevel,
      stack: process.env.LoggerStack
    }
  });
  
  router.use(async (req, res, next) => {
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

  router.use((error, req, res, next) => {
    req.log.error(error);
    res.cors();
    res.status(error.statusCode || 500).send({error: error.message});
    next();
  });

  await initializeDashboard(router);
  await initializeCard(router);

  return router.run(event, context);
}
