const dynogels = require('dynogels');
const joi = require('joi');

const DashboardSchema = {
  id: dynogels.types.uuid(),
  email: joi.string().required(),
  title: joi.string().default('dashboard #1')
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

const TokenSchema = {
  token: joi.string().required(),
  createdAt: joi.date().default(Date.now, 'time of creation'),
  destroyedAt: joi.date()
}

const UserSchema = {
  email: joi.string().required(),
  name: joi.string(),
  type: joi.string(),
  location: joi.string(),
  avatarUrl: joi.string(),
  currentToken: joi.string(),
  tokens: joi.array().items(TokenSchema)
};

const User = dynogels.define(process.env.usersTableName, {
  hashKey: 'email',
  timestamps: true,
  schema: UserSchema,
  tableName: process.env.usersTableName
});

module.exports = {
  Dashboard,
  Card,
  User
};