const dynogels = require('dynogels');
const joi = require('joi');

const GithubRequestSchema = {
  token: joi.string().required(),
  key: joi.string().required(),
  etag: joi.string().required(),
  value: joi.any()
};

const GithubRequest = dynogels.define(process.env.githubRequestsTableName, {
  hashKey: 'token',
  rangeKey: 'key',
  timestamps: true,
  schema: GithubRequestSchema,
  tableName: process.env.githubRequestsTableName
});

module.exports = {
  GithubRequest
};
