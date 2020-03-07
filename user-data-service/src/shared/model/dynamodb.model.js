const dynogels = require('dynogels');
const joi = require('joi');

const DashboardSchema = {
  id: joi.string().required(),
  email: joi.string().required(),
  title: joi.string().required()
};

const Dashboard = dynogels.define(process.env.dashboardsTableName, {
  hashKey: 'id',
  rangeKey: 'email',
  timestamps: true,
  schema: DashboardSchema,
  tableName: process.env.dashboardsTableName,
  indexes: [
      { hashKey: 'email', name: 'emailIndex', type: 'global' }
  ]
});

module.exports = {
  DashboardSchema,
  Dashboard
};