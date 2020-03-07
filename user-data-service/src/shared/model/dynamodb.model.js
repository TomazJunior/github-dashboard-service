const dynogels = require('dynogels');
const joi = require('joi');

const DashboardSchema = {
  id: dynogels.types.uuid(),
  email: joi.string().required(),
  title: joi.string().required()
};

const Dashboard = dynogels.define(process.env.dashboardsTableName, {
  hashKey: 'email',
  rangeKey: 'id',
  timestamps: true,
  schema: DashboardSchema,
  tableName: process.env.dashboardsTableName
});

const CardSchema = {
  id: dynogels.types.uuid(),
  dashboardId: joi.string().required(),
  title: joi.string().allow(''),
  email: joi.string().required(),
  type: joi.object().required(),
  repository: joi.object().required(),
  filter: joi.object().required(),
};

const Card = dynogels.define(process.env.cardsTableName, {
  hashKey: 'dashboardId',
  rangeKey: 'id',
  timestamps: true,
  schema: CardSchema,
  tableName: process.env.cardsTableName
});

module.exports = {
  Dashboard,
  Card
};