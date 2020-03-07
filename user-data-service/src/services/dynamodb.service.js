'use strict';
const AWS = require('aws-sdk');
const dynogels = require('dynogels');

class DynamoDBService {
  constructor(logger) {
    const driver = {
      region: process.env.region,
      endpoint: process.env.dynamoDBEndpoint,
      accessKeyId: process.env.dynamoDBaccessKey,
      secretAccessKey: process.env.dynamoDBaccessSecret
    };
    dynogels.dynamoDriver(new dynogels.AWS.DynamoDB(driver));
    dynogels.AWS.config.update(driver);
    this.dynamoDB = new dynogels.AWS.DynamoDB({apiVersion: '2012-08-10'});
    this.converter = dynogels.AWS.DynamoDB.Converter;
    this.converter = AWS.DynamoDB.Converter;
    this.logger = logger;
  }

  async write(tableName, item) {
    const loggerTag = 'DynamoDBService.write';
    this.logger.debug(loggerTag, 'process started');
    this.logger.debug(loggerTag, 'tableName:', tableName);
    return new Promise((resolve, reject) => {
      const params = {
        TableName: tableName,
        Item: this.converter.marshall(item)
      };
      this.dynamoDB.putItem(params, (err, data) => {
        if (err) { 
          this.logger.error(loggerTag, 'tableName:', 'Failed writing item ' + err);
          reject(err);
        } else {
          resolve(data);
          this.logger.error(loggerTag, 'process completed');
        }
      });
    });
  }

  async scan(tableName) {
    const loggerTag = 'DynamoDBService.scan';
    this.logger.debug(loggerTag, 'process started');
    this.logger.debug(loggerTag, 'tableName:', tableName);
    return new Promise(async (resolve, reject) => {
      const params = {
        TableName: tableName
      };
      this.dynamoDB.scan(params, (err, data) => {
        if (err) { 
          this.logger.debug(loggerTag, 'tableName:', 'Failed writing item ' + err);
          reject(err);
        } else {
          resolve(data.Items.map((item) => {
            return this.converter.unmarshall(item);
          }));
          this.logger.debug(loggerTag, 'process completed');
        }
      });
    });
  }

  async createTables() {
    return new Promise((resolve, reject) => {
      dynogels.createTables((error, data) => {
        this.logger.debug('error' + error + 'data' + data);
        if (error) {
          this.logger.error(error);
          reject(new Error('DynamoDB: Error creating tables. ' + error));
        } else {
          resolve();
        }
      });
    });
  }

}

module.exports = DynamoDBService;
