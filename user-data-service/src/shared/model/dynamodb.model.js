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
  position: joi.number(),
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
  email: joi.string().required(),
  token: joi.string().required(),
  destroyedAt: joi.date()
}

const Token = dynogels.define(process.env.tokensTableName, {
  hashKey: 'token',
  rangeKey: 'email',
  timestamps: true,
  schema: TokenSchema,
  tableName: process.env.tokensTableName
});

const UserSchema = {
  email: joi.string().required(),
  name: joi.string(),
  type: joi.string(),
  location: joi.string().allow(null),
  avatarUrl: joi.string().allow(null),
  dashboardId: joi.string().allow(''),
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
  Token,
  User
};