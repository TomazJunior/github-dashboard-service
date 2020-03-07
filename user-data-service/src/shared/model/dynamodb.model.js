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

module.exports = {
  Dashboard
};